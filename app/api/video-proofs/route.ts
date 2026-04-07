import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateVideoProof, detectVideoPlatform } from '@/lib/proofs/video';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: videos } = await supabase
    .from('video_proofs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false });

  return NextResponse.json(videos || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { url, category, description } = body;

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  const platform = detectVideoPlatform(url);
  if (!platform) {
    return NextResponse.json({ error: 'URL must be from Loom, YouTube, or Vimeo' }, { status: 400 });
  }

  // Validate and extract metadata
  const metadata = await validateVideoProof(url);

  const { data: video, error } = await supabase
    .from('video_proofs')
    .insert({
      profile_id: profile.id,
      url,
      platform,
      title: metadata?.title || null,
      thumbnail_url: metadata?.thumbnail_url || null,
      duration_seconds: metadata?.duration_seconds || null,
      category: category || null,
      tools_mentioned: metadata?.tools_mentioned || [],
      description: description || null,
      url_verified: metadata?.url_verified || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Video proof error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json(video);
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
    .from('video_proofs').delete().eq('id', id).eq('profile_id', profile.id);

  if (error) {
    console.error('Video proof error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
