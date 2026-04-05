import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profile_id } = body;

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
  }

  // Generate anonymous viewer hash from IP + UA
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const raw = `${ip}:${ua}`;

  // Simple hash — good enough for deduplication, not for security
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const viewerHash = Math.abs(hash).toString(36);

  const supabase = createAdminClient();

  // Upsert — unique per profile + viewer + day
  await supabase
    .from('profile_views')
    .upsert(
      { profile_id, viewer_hash: viewerHash },
      { onConflict: 'profile_id,viewer_hash,viewed_at' }
    );

  return NextResponse.json({ ok: true });
}
