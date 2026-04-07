import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, bio, avatar_url, website_url, linkedin_url, twitter_handle, role, company, looking_for_work, gtmcommit_score, gtmcommit_tier, score_breakdown, is_verified, profile_completeness, created_at'
    )
    .eq('username', username)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: 'Profile not found', message: `No profile found for username: ${username}` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const [toolsRes, portfolioRes, vouchCountRes, commitStatsRes] = await Promise.all([
    supabase.from('tool_declarations')
      .select('tool_name, proficiency, is_verified, verified_commit_count')
      .eq('profile_id', profile.id),
    supabase.from('portfolio_items')
      .select('title, description, url, category, tools_used, verification_status, vouch_count')
      .eq('profile_id', profile.id)
      .order('display_order'),
    supabase.from('vouches')
      .select('*', { count: 'exact', head: true })
      .eq('vouchee_id', profile.id),
    supabase.from('github_commits')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id)
      .not('ai_tool_detected', 'is', null),
  ]);

  // Strip internal ID before returning
  const { id: _id, ...publicProfile } = profile;

  return NextResponse.json({
    api_version: 'v1',
    data: {
      ...publicProfile,
      ai_commit_count: commitStatsRes.count || 0,
      vouch_count: vouchCountRes.count || 0,
      tools: toolsRes.data || [],
      portfolio: portfolioRes.data || [],
      badge_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com'}/api/badge/${username}`,
      profile_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com'}/${username}`,
    },
  }, { headers: CORS_HEADERS });
}
