import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateContentProof, detectContentPlatform } from '@/lib/proofs/content';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: content } = await supabase
    .from('content_proofs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false });

  return NextResponse.json(content || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { url, description, published_at } = body;

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  const platform = detectContentPlatform(url);
  const metadata = await validateContentProof(url);

  const { data: content, error } = await supabase
    .from('content_proofs')
    .insert({
      profile_id: profile.id,
      url,
      platform,
      title: metadata?.title || null,
      published_at: published_at || null,
      estimated_word_count: metadata?.estimated_word_count || null,
      tools_mentioned: metadata?.tools_mentioned || [],
      description: description || null,
      url_verified: metadata?.url_verified || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Content proof error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json(content);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { error } = await supabase
    .from('content_proofs').delete().eq('id', id).eq('profile_id', profile.id);

  if (error) {
    console.error('Content proof error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
