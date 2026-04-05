import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectPlatform } from '@/lib/proofs/verify';

export async function GET() {
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

  const { data: proofs } = await supabase
    .from('external_proofs')
    .select('*')
    .eq('profile_id', profile.id)
    .order('display_order');

  return NextResponse.json(proofs || []);
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const { project_url, project_name } = body;

  if (!project_url) {
    return NextResponse.json({ error: 'project_url is required' }, { status: 400 });
  }

  const source_type = detectPlatform(project_url);

  const { data: proof, error } = await supabase
    .from('external_proofs')
    .insert({
      profile_id: profile.id,
      source_type,
      project_url,
      project_name: project_name || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(proof);
}
