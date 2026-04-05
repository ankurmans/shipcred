import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canUserVouch } from '@/lib/vouches/anti-gaming';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: voucherProfile } = await supabase
    .from('profiles')
    .select('id, gtmcommit_score, created_at, is_verified, github_username')
    .eq('user_id', user.id)
    .single();

  if (!voucherProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // Anti-gaming: check vouch eligibility
  const eligibility = canUserVouch(voucherProfile);
  if (!eligibility.canVouch) {
    return NextResponse.json({ error: eligibility.reason }, { status: 403 });
  }

  const body = await request.json();
  const { vouchee_id, portfolio_item_id, message } = body;

  if (!vouchee_id) {
    return NextResponse.json({ error: 'vouchee_id is required' }, { status: 400 });
  }

  // Can't vouch for yourself
  if (vouchee_id === voucherProfile.id) {
    return NextResponse.json({ error: 'Cannot vouch for yourself' }, { status: 400 });
  }

  const { data: vouch, error } = await supabase
    .from('vouches')
    .insert({
      voucher_id: voucherProfile.id,
      vouchee_id,
      portfolio_item_id: portfolio_item_id || null,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already vouched for this person' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Trigger score recalculation for the vouchee
  const admin = createAdminClient();
  await admin.rpc('update_updated_at'); // Will trigger via DB triggers

  return NextResponse.json(vouch);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { error } = await supabase
    .from('vouches')
    .delete()
    .eq('id', id)
    .eq('voucher_id', profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
