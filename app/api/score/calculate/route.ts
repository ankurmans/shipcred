import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateShipCredScore, scoreToTier } from '@/lib/scoring/calculate';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const admin = createAdminClient();

  const [commitsRes, portfolioRes, vouchesRes, toolsRes, proofsRes] = await Promise.all([
    admin.from('github_commits').select('ai_tool_detected, committed_at').eq('profile_id', profile.id),
    admin.from('portfolio_items').select('vouch_count').eq('profile_id', profile.id),
    admin.from('vouches').select('id').eq('vouchee_id', profile.id),
    admin.from('tool_declarations').select('is_verified').eq('profile_id', profile.id),
    admin.from('external_proofs').select('verification_status, source_type').eq('profile_id', profile.id),
  ]);

  const score = calculateShipCredScore({
    commits: commitsRes.data || [],
    portfolioItems: portfolioRes.data || [],
    vouchCount: vouchesRes.data?.length || 0,
    toolDeclarations: toolsRes.data || [],
    externalProofs: proofsRes.data || [],
  });

  const tier = scoreToTier(score.total);

  await admin.from('profiles').update({
    shipcred_score: score.total,
    shipcred_tier: tier,
    score_breakdown: { github: score.github, portfolio: score.portfolio, vouches: score.vouches, tools: score.tools },
  }).eq('id', profile.id);

  return NextResponse.json({ score, tier });
}
