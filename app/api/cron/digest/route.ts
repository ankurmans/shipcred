import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { weeklyDigestEmail } from '@/lib/email/templates/weekly-digest';

export async function GET(request: NextRequest) {
  // Verify cron secret — reject if not configured to prevent Bearer undefined bypass
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get profiles that have email_notifications enabled and haven't received digest in 6+ days
  const sixDaysAgo = new Date(Date.now() - 6 * 86400 * 1000).toISOString();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, username, gtmcommit_score, gtmcommit_tier, user_id, email_notifications, last_digest_sent_at')
    .eq('email_notifications', true)
    .gt('gtmcommit_score', 0);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const profile of profiles) {
    // Skip if digest was sent recently
    if (profile.last_digest_sent_at && new Date(profile.last_digest_sent_at) > new Date(sixDaysAgo)) {
      continue;
    }

    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
    if (!user?.email) continue;

    // Get weekly views
    const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0];
    const { count: viewsThisWeek } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id)
      .gte('viewed_at', weekAgo);

    // Get rank
    const { count: higherScores } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('gtmcommit_score', profile.gtmcommit_score);
    const rank = (higherScores || 0) + 1;

    const email = weeklyDigestEmail(
      profile.display_name,
      profile.username,
      profile.gtmcommit_score,
      profile.gtmcommit_tier,
      rank,
      viewsThisWeek || 0,
    );

    const success = await sendEmail({ to: user.email, ...email });
    if (success) {
      await supabase
        .from('profiles')
        .update({ last_digest_sent_at: new Date().toISOString() })
        .eq('id', profile.id);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
