import { createAdminClient } from '@/lib/supabase/admin';
import { CHALLENGES, type ChallengeDefinition } from './challenges';

interface ProfileContext {
  id: string;
  github_username: string | null;
  profile_completeness: number;
}

interface DataCounts {
  videoCount: number;
  contentCount: number;
  certCount: number;
  vouchesGiven: number;
  verifiedTools: number;
}

function evaluateProgress(challenge: ChallengeDefinition, profile: ProfileContext, data: DataCounts): number {
  switch (challenge.id) {
    case 'complete_profile':
      return profile.profile_completeness || 0;
    case 'first_github_sync':
      return profile.github_username ? 1 : 0;
    case 'first_proof':
      return Math.min(1, data.videoCount + data.contentCount + data.certCount);
    case 'first_vouch_given':
      return Math.min(1, data.vouchesGiven);
    case 'tool_collector_5':
      return data.verifiedTools;
    case 'content_machine':
      return data.contentCount;
    case 'community_builder':
      return data.vouchesGiven;
    case 'video_creator':
      return data.videoCount;
    default:
      return 0;
  }
}

export async function assignAndEvaluateChallenges(
  profile: ProfileContext,
  data: DataCounts,
): Promise<void> {
  const supabase = createAdminClient();

  // Get existing challenges for this profile
  const { data: existing } = await supabase
    .from('profile_challenges')
    .select('challenge_id, status, progress')
    .eq('profile_id', profile.id);

  const existingMap = new Map((existing || []).map(c => [c.challenge_id, c]));

  // Assign onboarding challenges if not already assigned
  const onboarding = CHALLENGES.filter(c => c.track === 'onboarding');
  for (const challenge of onboarding) {
    if (!existingMap.has(challenge.id)) {
      await supabase.from('profile_challenges').upsert({
        profile_id: profile.id,
        challenge_id: challenge.id,
        status: 'active',
        progress: 0,
        target: challenge.target,
        expires_at: challenge.expiresInDays
          ? new Date(Date.now() + challenge.expiresInDays * 86400000).toISOString()
          : null,
      }, { onConflict: 'profile_id,challenge_id' });
    }
  }

  // Assign stretch challenges if not already assigned
  const stretch = CHALLENGES.filter(c => c.track === 'stretch');
  for (const challenge of stretch) {
    if (!existingMap.has(challenge.id)) {
      await supabase.from('profile_challenges').upsert({
        profile_id: profile.id,
        challenge_id: challenge.id,
        status: 'active',
        progress: 0,
        target: challenge.target,
        expires_at: null,
      }, { onConflict: 'profile_id,challenge_id' });
    }
  }

  // Evaluate progress on all active challenges
  const { data: active } = await supabase
    .from('profile_challenges')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('status', 'active');

  if (!active) return;

  for (const row of active) {
    const def = CHALLENGES.find(c => c.id === row.challenge_id);
    if (!def) continue;

    // Check expiry
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      await supabase
        .from('profile_challenges')
        .update({ status: 'expired' })
        .eq('id', row.id);
      continue;
    }

    const progress = evaluateProgress(def, profile, data);

    if (progress >= def.target && row.status !== 'completed') {
      await supabase
        .from('profile_challenges')
        .update({ progress, status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', row.id);
    } else if (progress !== row.progress) {
      await supabase
        .from('profile_challenges')
        .update({ progress })
        .eq('id', row.id);
    }
  }
}
