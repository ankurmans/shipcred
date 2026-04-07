import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FlagType, FlagReason } from '@/types';

const VALID_FLAG_TYPES: FlagType[] = ['profile', 'portfolio_item', 'upload', 'vouch', 'video_proof', 'content_proof', 'certification'];
const VALID_REASONS: FlagReason[] = ['fake_commits', 'copied_file', 'fake_vouch', 'spam', 'other'];
const FLAG_THRESHOLD_HIDE = 3;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { flag_type, target_id, target_profile_id, reason, description } = body;

  if (!flag_type || !target_id || !target_profile_id || !reason) {
    return NextResponse.json({ error: 'flag_type, target_id, target_profile_id, and reason are required' }, { status: 400 });
  }

  if (!VALID_FLAG_TYPES.includes(flag_type)) {
    return NextResponse.json({ error: 'Invalid flag_type' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
  }

  // Can't flag yourself
  if (target_profile_id === profile.id) {
    return NextResponse.json({ error: 'Cannot flag your own content' }, { status: 400 });
  }

  const { data: flag, error } = await supabase
    .from('flags')
    .insert({
      reporter_id: profile.id,
      flag_type,
      target_id,
      target_profile_id,
      reason,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already flagged this item' }, { status: 409 });
    }
    console.error('Flag creation error:', error.message);
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 400 });
  }

  // Check if threshold reached — auto-hide item
  const admin = createAdminClient();
  const { count } = await admin
    .from('flags')
    .select('id', { count: 'exact', head: true })
    .eq('flag_type', flag_type)
    .eq('target_id', target_id)
    .eq('status', 'pending');

  if (count && count >= FLAG_THRESHOLD_HIDE) {
    // TODO: When admin review system is built, mark item as hidden
    // For now, just record the threshold breach
    console.log(`Flag threshold reached for ${flag_type}:${target_id} (${count} flags)`);
  }

  return NextResponse.json(flag);
}
