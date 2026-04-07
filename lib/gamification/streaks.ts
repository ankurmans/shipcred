import { createAdminClient } from '@/lib/supabase/admin';

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getPreviousWeek(isoWeek: string): string {
  // Parse ISO week and subtract 7 days
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // Get first day of the ISO week, then subtract 7 days
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const firstMonday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  const targetDate = new Date(firstMonday.getTime() + (week - 1) * 7 * 86400000 - 7 * 86400000);

  return getISOWeek(targetDate);
}

export async function updateStreak(profileId: string): Promise<{ current: number; longest: number }> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_activity_week')
    .eq('id', profileId)
    .single();

  if (!profile) return { current: 0, longest: 0 };

  // If no last_activity_week, backfill from commit history
  if (!profile.last_activity_week) {
    const result = await calculateStreakFromHistory(profileId);
    await supabase.from('profiles').update({
      current_streak: result.current,
      longest_streak: result.longest,
      last_activity_week: getISOWeek(new Date()),
    }).eq('id', profileId);
    return result;
  }

  const currentWeek = getISOWeek(new Date());
  const lastWeek = profile.last_activity_week;

  // Already tracked this week
  if (lastWeek === currentWeek) {
    return { current: profile.current_streak, longest: profile.longest_streak };
  }

  let newStreak: number;
  const previousWeek = getPreviousWeek(currentWeek);

  if (lastWeek === previousWeek) {
    // Consecutive week — extend streak
    newStreak = (profile.current_streak || 0) + 1;
  } else {
    // Gap — reset streak
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longest_streak || 0);

  await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_week: currentWeek,
    })
    .eq('id', profileId);

  return { current: newStreak, longest: newLongest };
}

async function calculateStreakFromHistory(profileId: string): Promise<{ current: number; longest: number }> {
  const supabase = createAdminClient();

  const { data: commits } = await supabase
    .from('github_commits')
    .select('committed_at')
    .eq('profile_id', profileId)
    .not('ai_tool_detected', 'is', null)
    .order('committed_at', { ascending: false });

  if (!commits || commits.length === 0) return { current: 0, longest: 0 };

  // Get unique active weeks sorted descending
  const weeks = [...new Set(commits.map(c => getISOWeek(new Date(c.committed_at))))].sort().reverse();

  if (weeks.length === 0) return { current: 0, longest: 0 };

  // Calculate current streak (consecutive weeks from now)
  const currentWeek = getISOWeek(new Date());
  let current = 0;
  let checkWeek = currentWeek;

  // Allow current week or previous week as starting point
  if (weeks[0] === currentWeek || weeks[0] === getPreviousWeek(currentWeek)) {
    checkWeek = weeks[0];
  }

  for (const week of weeks) {
    if (week === checkWeek) {
      current++;
      checkWeek = getPreviousWeek(checkWeek);
    } else if (week < checkWeek) {
      break;
    }
  }

  // Calculate longest streak across all history
  let longest = 0;
  let streak = 1;
  const sortedWeeks = [...weeks].sort();

  for (let i = 1; i < sortedWeeks.length; i++) {
    const expected = getISOWeek(new Date(
      new Date(sortedWeeks[i - 1].replace('-W', '-01-')).getTime() + 7 * 86400000
    ));
    // Simpler: check if this week is the next week after previous
    const prev = sortedWeeks[i - 1];
    let nextExpected = prev;
    // Walk forward one week
    nextExpected = getNextWeek(prev);

    if (sortedWeeks[i] === nextExpected) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak, current);

  return { current, longest };
}

function getNextWeek(isoWeek: string): string {
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const firstMonday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  const targetDate = new Date(firstMonday.getTime() + (week - 1) * 7 * 86400000 + 7 * 86400000);

  return getISOWeek(targetDate);
}
