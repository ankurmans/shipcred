import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRepos, fetchCommits } from './api';
import { detectAITool } from './detect-ai';
import { calculateShipCredScore, scoreToTier } from '@/lib/scoring/calculate';

function sixMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

export async function syncGitHubData(profileId: string, accessToken: string) {
  const supabase = createAdminClient();

  // Create sync job
  const { data: job } = await supabase
    .from('github_sync_jobs')
    .insert({ profile_id: profileId, status: 'running', started_at: new Date().toISOString() })
    .select('id')
    .single();

  const jobId = job?.id;
  let reposScanned = 0;
  let commitsAnalyzed = 0;
  let aiCommitsFound = 0;

  try {
    const repos = await fetchAllRepos(accessToken);

    // Get the GitHub username for filtering
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_username')
      .eq('id', profileId)
      .single();

    for (const repo of repos) {
      reposScanned++;

      const commits = await fetchCommits(accessToken, repo.full_name, {
        since: sixMonthsAgo(),
        author: profile?.github_username || repo.owner.login,
      });

      for (const commit of commits) {
        commitsAnalyzed++;
        const detection = detectAITool(commit);
        if (detection) aiCommitsFound++;

        // Upsert commit data
        await supabase.from('github_commits').upsert(
          {
            profile_id: profileId,
            commit_sha: commit.sha,
            repo_full_name: repo.full_name,
            repo_is_private: repo.private,
            commit_message: repo.private
              ? '[private]'
              : commit.commit.message.split('\n')[0],
            committed_at: commit.commit.author.date,
            ai_tool_detected: detection?.tool || null,
            ai_detection_method: detection?.method || null,
            ai_detection_confidence: detection?.confidence || 0,
            additions: commit.stats?.additions || 0,
            deletions: commit.stats?.deletions || 0,
            files_changed: commit.files?.length || 0,
          },
          { onConflict: 'commit_sha,profile_id' }
        );
      }
    }

    // Auto-verify tool declarations
    await autoVerifyTools(profileId);

    // Recalculate score
    await recalculateScore(profileId);

    // Update sync job
    if (jobId) {
      await supabase.from('github_sync_jobs').update({
        status: 'completed',
        repos_scanned: reposScanned,
        commits_analyzed: commitsAnalyzed,
        ai_commits_found: aiCommitsFound,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }

    // Update profile last sync time
    await supabase
      .from('profiles')
      .update({ last_github_sync_at: new Date().toISOString() })
      .eq('id', profileId);

  } catch (error) {
    if (jobId) {
      await supabase.from('github_sync_jobs').update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
        repos_scanned: reposScanned,
        commits_analyzed: commitsAnalyzed,
        ai_commits_found: aiCommitsFound,
      }).eq('id', jobId);
    }
    throw error;
  }
}

async function autoVerifyTools(profileId: string) {
  const supabase = createAdminClient();

  // Get AI tool counts from commits
  const { data: commits } = await supabase
    .from('github_commits')
    .select('ai_tool_detected')
    .eq('profile_id', profileId)
    .not('ai_tool_detected', 'is', null);

  if (!commits) return;

  const toolCounts: Record<string, number> = {};
  for (const c of commits) {
    const tool = c.ai_tool_detected;
    if (tool) toolCounts[tool] = (toolCounts[tool] || 0) + 1;
  }

  // Upsert verified tool declarations
  for (const [toolName, count] of Object.entries(toolCounts)) {
    await supabase.from('tool_declarations').upsert(
      {
        profile_id: profileId,
        tool_name: toolName,
        is_verified: true,
        verified_commit_count: count,
        proficiency: count >= 50 ? 'expert' : count >= 20 ? 'power_user' : count >= 5 ? 'user' : 'beginner',
      },
      { onConflict: 'profile_id,tool_name' }
    );
  }
}

async function recalculateScore(profileId: string) {
  const supabase = createAdminClient();

  // Fetch all data needed for scoring
  const [commitsRes, portfolioRes, vouchesRes, toolsRes, proofsRes] = await Promise.all([
    supabase.from('github_commits').select('*').eq('profile_id', profileId),
    supabase.from('portfolio_items').select('*').eq('profile_id', profileId),
    supabase.from('vouches').select('*').eq('vouchee_id', profileId),
    supabase.from('tool_declarations').select('*').eq('profile_id', profileId),
    supabase.from('external_proofs').select('*').eq('profile_id', profileId),
  ]);

  const score = calculateShipCredScore({
    commits: commitsRes.data || [],
    portfolioItems: portfolioRes.data || [],
    vouchCount: vouchesRes.data?.length || 0,
    toolDeclarations: toolsRes.data || [],
    externalProofs: proofsRes.data || [],
  });

  const tier = scoreToTier(score.total);

  await supabase.from('profiles').update({
    shipcred_score: score.total,
    shipcred_tier: tier,
    score_breakdown: {
      github: score.github,
      portfolio: score.portfolio,
      vouches: score.vouches,
      tools: score.tools,
    },
    is_verified: (commitsRes.data || []).some(c => c.ai_tool_detected !== null),
  }).eq('id', profileId);
}
