import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectAITool } from '@/lib/github/detect-ai';
import type { GitHubAPICommit } from '@/types';

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');

  // Only process push events
  if (event === 'ping') {
    return NextResponse.json({ message: 'pong' });
  }

  if (event !== 'push') {
    return NextResponse.json({ message: `Ignored event: ${event}` });
  }

  const payload = JSON.parse(body);
  const repoFullName = payload.repository?.full_name;
  const isPrivate = payload.repository?.private || false;
  const pusherLogin = payload.pusher?.name;

  if (!repoFullName || !pusherLogin) {
    return NextResponse.json({ error: 'Missing repo or pusher info' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find the profile for this GitHub user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, github_access_token')
    .eq('github_username', pusherLogin)
    .single();

  if (!profile) {
    // User not on platform — ignore
    return NextResponse.json({ message: 'User not registered' });
  }

  const commits = payload.commits || [];
  let aiCommitsFound = 0;

  for (const commit of commits) {
    // Map webhook commit format to our GitHubAPICommit shape for detectAITool
    const mappedCommit: GitHubAPICommit = {
      sha: commit.id,
      commit: {
        message: commit.message || '',
        author: {
          name: commit.author?.name || '',
          email: commit.author?.email || '',
          date: commit.timestamp || new Date().toISOString(),
        },
        committer: {
          name: commit.committer?.name || '',
          email: commit.committer?.email || '',
          date: commit.timestamp || new Date().toISOString(),
        },
        tree: { sha: commit.tree_id || '' },
      },
      committer: {
        login: commit.committer?.username || commit.committer?.name || '',
      },
      stats: undefined,
      files: commit.added?.concat(commit.modified || [], commit.removed || []).map((f: string) => ({ filename: f })),
    };

    const detection = detectAITool(mappedCommit);
    if (detection) aiCommitsFound++;

    const filesChanged = (commit.added?.length || 0) + (commit.modified?.length || 0) + (commit.removed?.length || 0);

    // Upsert commit
    await supabase.from('github_commits').upsert(
      {
        profile_id: profile.id,
        commit_sha: commit.id,
        repo_full_name: repoFullName,
        repo_is_private: isPrivate,
        commit_message: isPrivate ? '[private]' : (commit.message || '').split('\n')[0],
        committed_at: commit.timestamp,
        ai_tool_detected: detection?.tool || null,
        ai_detection_method: detection?.method || null,
        ai_detection_confidence: detection?.confidence || 0,
        additions: 0, // Webhook payload doesn't include diff stats
        deletions: 0,
        files_changed: filesChanged,
      },
      { onConflict: 'commit_sha,profile_id' }
    );
  }

  // If any AI commits were found, trigger a lightweight score recalc
  if (aiCommitsFound > 0) {
    // Auto-verify tools based on new commits
    const { data: allAiCommits } = await supabase
      .from('github_commits')
      .select('ai_tool_detected')
      .eq('profile_id', profile.id)
      .not('ai_tool_detected', 'is', null);

    if (allAiCommits) {
      const toolCounts: Record<string, number> = {};
      for (const c of allAiCommits) {
        if (c.ai_tool_detected) toolCounts[c.ai_tool_detected] = (toolCounts[c.ai_tool_detected] || 0) + 1;
      }

      for (const [toolName, count] of Object.entries(toolCounts)) {
        await supabase.from('tool_declarations').upsert(
          {
            profile_id: profile.id,
            tool_name: toolName,
            is_verified: true,
            verified_commit_count: count,
            proficiency: count >= 50 ? 'expert' : count >= 20 ? 'power_user' : count >= 5 ? 'user' : 'beginner',
          },
          { onConflict: 'profile_id,tool_name' }
        );
      }
    }
  }

  return NextResponse.json({
    message: 'Processed',
    commits_processed: commits.length,
    ai_commits_found: aiCommitsFound,
  });
}
