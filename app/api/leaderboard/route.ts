import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const supabase = createAdminClient();

  let query = supabase
    .from('profiles')
    .select('username, display_name, avatar_url, role, company, gtmcommit_score, gtmcommit_tier')
    .gt('gtmcommit_score', 0)
    .order('gtmcommit_score', { ascending: false })
    .limit(limit);

  if (role) {
    query = query.eq('role', role);
  }

  const { data } = await query;

  return NextResponse.json(data || []);
}
