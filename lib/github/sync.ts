import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRepos, fetchCommits } from './api';
import { detectAITool } from './detect-ai';
import { applyGitHubAntiGaming, isSubstantiveCommit } from './anti-gaming';
import { calculateGtmCommitScore, scoreToTier } from '@/lib/scoring/calculate';
import { applyVelocityLimit } from '@/lib/scoring/velocity';

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

    // Get user emails for authorship validation
    const userEmails = [profile?.github_username || ''].filter(Boolean);

    for (const repo of repos) {
      reposScanned++;

      const rawCommits = await fetchCommits(accessToken, repo.full_name, {
        since: sixMonthsAgo(),
        author: profile?.github_username || repo.owner.login,
      });

      // Count AI commits before filtering for spoofing detection
      let repoAiCount = 0;
      for (const c of rawCommits) {
        if (detectAITool(c)) repoAiCount++;
      }

      // Apply anti-gaming filters
      const { filteredCommits } = applyGitHubAntiGaming(
        rawCommits,
        repo,
        userEmails,
        repoAiCount
      );

      for (const commit of filteredCommits) {
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
  const [commitsRes, portfolioRes, vouchesRes, toolsRes, proofsRes, videosRes, contentRes, certsRes, uploadsRes, profileRes] = await Promise.all([
    supabase.from('github_commits').select('ai_tool_detected, committed_at, repo_full_name').eq('profile_id', profileId),
    supabase.from('portfolio_items').select('vouch_count').eq('profile_id', profileId),
    supabase.from('vouches').select('id').eq('vouchee_id', profileId),
    supabase.from('tool_declarations').select('is_verified, tool_name').eq('profile_id', profileId),
    supabase.from('external_proofs').select('verification_status, source_type').eq('profile_id', profileId),
    supabase.from('video_proofs').select('url_verified, duration_seconds, category, vouch_count').eq('profile_id', profileId),
    supabase.from('content_proofs').select('url_verified, platform, vouch_count').eq('profile_id', profileId),
    supabase.from('certifications').select('verification_status, issuer, vouch_count').eq('profile_id', profileId),
    supabase.from('uploaded_files').select('is_parsed_valid, vouch_count, file_type').eq('profile_id', profileId),
    supabase.from('profiles').select('gtmcommit_score, bio, avatar_url, display_name, website_url, linkedin_url, twitter_handle, role').eq('id', profileId).single(),
  ]);

  const currentProfile = profileRes.data;

  const score = calculateGtmCommitScore({
    commits: commitsRes.data || [],
    portfolioItems: portfolioRes.data || [],
    vouchCount: vouchesRes.data?.length || 0,
    toolDeclarations: toolsRes.data || [],
    externalProofs: proofsRes.data || [],
    videoProofs: videosRes.data || [],
    contentProofs: contentRes.data || [],
    certifications: certsRes.data || [],
    uploadedFiles: uploadsRes.data || [],
    profile: currentProfile ? {
      bio: currentProfile.bio,
      avatar_url: currentProfile.avatar_url,
      display_name: currentProfile.display_name,
      website_url: currentProfile.website_url,
      linkedin_url: currentProfile.linkedin_url,
      twitter_handle: currentProfile.twitter_handle,
      role: currentProfile.role,
    } : undefined,
  });

  const previousScore = currentProfile?.gtmcommit_score || 0;

  // Apply velocity limit: max +200 pts per 24 hours
  const finalScore = await applyVelocityLimit(profileId, score.total, previousScore);
  const tier = scoreToTier(finalScore);

  await supabase.from('profiles').update({
    gtmcommit_score: finalScore,
    gtmcommit_tier: tier,
    score_breakdown: score,
    is_verified: (commitsRes.data || []).some(c => c.ai_tool_detected !== null),
  }).eq('id', profileId);
}
