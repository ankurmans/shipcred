import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const u1 = searchParams.get('u1');
  const u2 = searchParams.get('u2');

  if (!u1 || !u2) {
    return new Response('Missing u1 or u2', { status: 400 });
  }

  const supabase = createAdminClient();
  const [r1, r2] = await Promise.all([
    supabase.from('profiles').select('display_name, gtmcommit_score, gtmcommit_tier, avatar_url').eq('username', u1).single(),
    supabase.from('profiles').select('display_name, gtmcommit_score, gtmcommit_tier, avatar_url').eq('username', u2).single(),
  ]);

  const p1 = r1.data;
  const p2 = r2.data;
  if (!p1 || !p2) return new Response('Not found', { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          background: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#666', marginBottom: '40px' }}>
          Who ships more with AI?
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
          {/* User 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {p1.avatar_url ? (
              <img src={p1.avatar_url} width="80" height="80" style={{ borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FF5C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: 700 }}>
                {p1.display_name.charAt(0)}
              </div>
            )}
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '12px' }}>{p1.display_name}</div>
            <div style={{ fontSize: '56px', fontWeight: 800, color: p1.gtmcommit_score >= p2.gtmcommit_score ? '#FF5C00' : '#666', marginTop: '8px' }}>
              {p1.gtmcommit_score}
            </div>
          </div>

          <div style={{ fontSize: '48px', fontWeight: 800, color: '#ccc' }}>vs</div>

          {/* User 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {p2.avatar_url ? (
              <img src={p2.avatar_url} width="80" height="80" style={{ borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: 700 }}>
                {p2.display_name.charAt(0)}
              </div>
            )}
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '12px' }}>{p2.display_name}</div>
            <div style={{ fontSize: '56px', fontWeight: 800, color: p2.gtmcommit_score >= p1.gtmcommit_score ? '#FF5C00' : '#666', marginTop: '8px' }}>
              {p2.gtmcommit_score}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ color: '#9ca3af', fontSize: '18px' }}>gtmcommit.com</div>
          <div style={{ color: '#9ca3af', fontSize: '18px' }}>Talk is cheap. Commits aren&apos;t.</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
