import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'node:crypto';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  // Rate limit: 60 view registrations per minute per IP
  const rl = rateLimit(getRateLimitKey(request, 'profile-view'), { windowMs: 60_000, max: 60 });
  if (!rl.success) {
    return NextResponse.json({ ok: true }); // Silently drop, don't reveal rate limit
  }

  const body = await request.json();
  const { profile_id } = body;

  if (!profile_id || !UUID_REGEX.test(profile_id)) {
    return NextResponse.json({ error: 'Valid profile_id required' }, { status: 400 });
  }

  // Generate viewer hash from IP + UA using SHA-256 (not weak bitwise)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const viewerHash = crypto
    .createHash('sha256')
    .update(`${ip}:${ua}`)
    .digest('hex')
    .slice(0, 16);

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
