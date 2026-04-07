import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncGitHubData } from '@/lib/github/sync';

// Daily cron: re-sync GitHub commits for all connected profiles
// Secured by CRON_SECRET env var

export const maxDuration = 300; // 5 min max for Vercel

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all profiles with GitHub connected
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, github_access_token, github_username')
    .not('github_access_token', 'is', null)
    .not('github_username', 'is', null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No profiles to sync', synced: 0 });
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    try {
      await syncGitHubData(profile.id, profile.github_access_token);

      // Update last sync timestamp
      await admin.from('profiles').update({
        last_github_sync_at: new Date().toISOString(),
      }).eq('id', profile.id);

      synced++;
    } catch (err) {
      failed++;
      errors.push(`${profile.github_username}: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }

  return NextResponse.json({
    total: profiles.length,
    synced,
    failed,
    errors: errors.slice(0, 10),
  });
}
