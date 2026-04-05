import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateGtmCommitScore, scoreToTier } from '@/lib/scoring/calculate';
import { updateStreak } from '@/lib/gamification/streaks';
import { detectMilestones, saveMilestones } from '@/lib/milestones';
import { assignAndEvaluateChallenges } from '@/lib/gamification/challenge-assigner';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, bio, avatar_url, display_name, website_url, linkedin_url, twitter_handle, role, github_username, profile_completeness')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const admin = createAdminClient();

  const [commitsRes, portfolioRes, vouchesRes, toolsRes, proofsRes, videosRes, contentRes, certsRes, uploadsRes] = await Promise.all([
    admin.from('github_commits').select('ai_tool_detected, committed_at, repo_full_name').eq('profile_id', profile.id),
    admin.from('portfolio_items').select('vouch_count').eq('profile_id', profile.id),
    admin.from('vouches').select('id').eq('vouchee_id', profile.id),
    admin.from('tool_declarations').select('is_verified, tool_name').eq('profile_id', profile.id),
    admin.from('external_proofs').select('verification_status, source_type').eq('profile_id', profile.id),
    admin.from('video_proofs').select('url_verified, duration_seconds, category, vouch_count').eq('profile_id', profile.id),
    admin.from('content_proofs').select('url_verified, platform, vouch_count').eq('profile_id', profile.id),
    admin.from('certifications').select('verification_status, issuer, vouch_count').eq('profile_id', profile.id),
    admin.from('uploaded_files').select('is_parsed_valid, vouch_count, file_type').eq('profile_id', profile.id),
  ]);

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
    profile: {
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      display_name: profile.display_name,
      website_url: profile.website_url,
      linkedin_url: profile.linkedin_url,
      twitter_handle: profile.twitter_handle,
      role: profile.role,
    },
  });

  const tier = scoreToTier(score.total);

  // Get old score/tier for milestone detection
  const { data: oldProfile } = await admin
    .from('profiles')
    .select('gtmcommit_score, gtmcommit_tier')
    .eq('id', profile.id)
    .single();

  const oldScore = oldProfile?.gtmcommit_score || 0;
  const oldTier = oldProfile?.gtmcommit_tier || 'unranked';

  await admin.from('profiles').update({
    gtmcommit_score: score.total,
    gtmcommit_tier: tier,
    score_breakdown: score,
  }).eq('id', profile.id);

  // Update streak
  await updateStreak(profile.id);

  // Detect and save milestones
  const aiCommitCount = (commitsRes.data || []).filter((c: any) => c.ai_tool_detected).length;
  const vouchCount = vouchesRes.data?.length || 0;
  const milestones = detectMilestones(oldScore, score.total, oldTier, tier, aiCommitCount, vouchCount, 0);
  await saveMilestones(profile.id, milestones);

  // Evaluate challenges
  const vouchesGivenRes = await admin.from('vouches').select('*', { count: 'exact', head: true }).eq('voucher_id', profile.id);
  await assignAndEvaluateChallenges(
    { id: profile.id, github_username: profile.github_username, profile_completeness: profile.profile_completeness || 0 },
    {
      videoCount: (videosRes.data || []).length,
      contentCount: (contentRes.data || []).length,
      certCount: (certsRes.data || []).length,
      vouchesGiven: vouchesGivenRes.count || 0,
      verifiedTools: (toolsRes.data || []).filter((t: any) => t.is_verified).length,
    },
  );

  return NextResponse.json({ score, tier });
}
