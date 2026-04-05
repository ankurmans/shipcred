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
  } else if (!lastWeek) {
    // First activity ever
    newStreak = 1;
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
