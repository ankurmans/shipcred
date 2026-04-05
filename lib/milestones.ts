import { createAdminClient } from '@/lib/supabase/admin';

export interface MilestoneEvent {
  type: string;
  value: string;
  label: string;
  emoji: string;
  shareText: string;
}

const SCORE_THRESHOLDS = [100, 250, 500, 750];
const COMMIT_THRESHOLDS = [1, 10, 50, 100];
const TIER_ORDER = ['unranked', 'shipper', 'builder', 'captain', 'legend'];
const TIER_LABELS: Record<string, string> = {
  shipper: 'Shipper',
  builder: 'Builder',
  captain: 'Captain',
  legend: 'Legend',
};
const TIER_EMOJI: Record<string, string> = {
  shipper: '📦',
  builder: '🔨',
  captain: '🚀',
  legend: '🏆',
};

export function detectMilestones(
  oldScore: number,
  newScore: number,
  oldTier: string,
  newTier: string,
  aiCommitCount: number,
  vouchCount: number,
  previousVouchCount: number,
): MilestoneEvent[] {
  const milestones: MilestoneEvent[] = [];

  // Tier upgrade
  if (TIER_ORDER.indexOf(newTier) > TIER_ORDER.indexOf(oldTier) && newTier !== 'unranked') {
    milestones.push({
      type: 'tier_upgrade',
      value: newTier,
      label: `${TIER_LABELS[newTier]} Tier Unlocked!`,
      emoji: TIER_EMOJI[newTier] || '🎉',
      shareText: `Just hit ${TIER_LABELS[newTier]} tier on GTM Commit! ${newScore}/1000. #GTMCommit #AIShipped`,
    });
  }

  // Score milestones
  for (const threshold of SCORE_THRESHOLDS) {
    if (oldScore < threshold && newScore >= threshold) {
      milestones.push({
        type: 'score_milestone',
        value: String(threshold),
        label: `Score ${threshold} Reached!`,
        emoji: '⭐',
        shareText: `My GTM Commit Score just crossed ${threshold}! Talk is cheap. Commits aren't. #GTMCommit`,
      });
    }
  }

  // First AI commit
  if (aiCommitCount === 1) {
    milestones.push({
      type: 'commit_count',
      value: '1',
      label: 'First AI Commit Detected!',
      emoji: '🎯',
      shareText: 'My first AI-assisted commit was just verified on GTM Commit! #GTMCommit #AIShipped',
    });
  }

  // Commit count milestones
  for (const threshold of COMMIT_THRESHOLDS.filter(t => t > 1)) {
    if (aiCommitCount >= threshold && aiCommitCount < threshold + 5) {
      milestones.push({
        type: 'commit_count',
        value: String(threshold),
        label: `${threshold} AI Commits!`,
        emoji: '🔥',
        shareText: `${threshold} verified AI commits on GTM Commit. Still shipping. #GTMCommit #AIShipped`,
      });
    }
  }

  // First vouch
  if (previousVouchCount === 0 && vouchCount >= 1) {
    milestones.push({
      type: 'first_vouch',
      value: '1',
      label: 'First Vouch Received!',
      emoji: '🤝',
      shareText: 'Just got my first community vouch on GTM Commit! Proof that real builders vouch for real work. #GTMCommit',
    });
  }

  return milestones;
}

export async function saveMilestones(profileId: string, milestones: MilestoneEvent[]): Promise<void> {
  if (milestones.length === 0) return;

  const supabase = createAdminClient();

  for (const m of milestones) {
    await supabase
      .from('profile_milestones')
      .upsert(
        {
          profile_id: profileId,
          milestone_type: m.type,
          milestone_value: m.value,
        },
        { onConflict: 'profile_id,milestone_type,milestone_value' }
      );
  }
}
