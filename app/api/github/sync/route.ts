import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncGitHubData } from '@/lib/github/sync';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, github_access_token')
    .eq('user_id', user.id)
    .single();

  if (!profile?.github_access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  try {
    await syncGitHubData(profile.id, profile.github_access_token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
