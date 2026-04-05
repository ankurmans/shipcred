import { createAdminClient } from '@/lib/supabase/admin';

const MAX_DAILY_GAIN = 200;

export async function applyVelocityLimit(
  profileId: string,
  newScore: number,
  previousScore: number
): Promise<number> {
  const supabase = createAdminClient();

  // Check last score update within 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentHistory } = await supabase
    .from('score_history')
    .select('score, recorded_at')
    .eq('profile_id', profileId)
    .gte('recorded_at', oneDayAgo)
    .order('recorded_at', { ascending: true })
    .limit(1);

  // If there's a recent history entry, use it as the baseline
  const baseline = recentHistory?.[0]?.score ?? previousScore;
  const dailyGain = newScore - baseline;

  // Skip velocity limit on first-ever score (new profile, not gaming)
  let finalScore = newScore;
  if (previousScore === 0 && !recentHistory?.length) {
    // First sync — allow full score
  } else if (dailyGain > MAX_DAILY_GAIN) {
    finalScore = baseline + MAX_DAILY_GAIN;
  }

  // Record score history
  await supabase.from('score_history').insert({
    profile_id: profileId,
    score: finalScore,
    previous_score: previousScore,
  });

  return finalScore;
}
