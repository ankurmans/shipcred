import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, bio, avatar_url, website_url, linkedin_url, twitter_handle, role, company, looking_for_work, shipcred_score, shipcred_tier, score_breakdown, is_featured, is_verified, profile_completeness, created_at'
    )
    .eq('username', username)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const [portfolioRes, toolsRes, vouchesRes] = await Promise.all([
    supabase.from('portfolio_items').select('*').eq('profile_id', profile.id).order('display_order'),
    supabase.from('tool_declarations').select('*').eq('profile_id', profile.id),
    supabase.from('vouches').select('*, voucher:voucher_id(username, display_name, avatar_url)').eq('vouchee_id', profile.id),
  ]);

  return NextResponse.json({
    ...profile,
    portfolio_items: portfolioRes.data || [],
    tool_declarations: toolsRes.data || [],
    vouches_received: vouchesRes.data || [],
  });
}
