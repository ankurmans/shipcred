import { ImageResponse } from '@vercel/og';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTierInfo } from '@/lib/scoring/tiers';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, role, company, avatar_url, shipcred_score, shipcred_tier')
    .eq('username', username)
    .single();

  if (!profile) {
    return new Response('Not found', { status: 404 });
  }

  const tierInfo = getTierInfo(profile.shipcred_tier);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          background: '#ffffff',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              width="80"
              height="80"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 700,
              }}
            >
              {profile.display_name.charAt(0)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#1f2937', fontSize: '36px', fontWeight: 700 }}>
              {profile.display_name}
            </div>
            <div style={{ color: '#6b7280', fontSize: '20px' }}>
              @{profile.username}
              {profile.role ? ` · ${profile.role}` : ''}
              {profile.company ? ` @ ${profile.company}` : ''}
            </div>
          </div>
        </div>

        {/* Score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              background: '#10b981',
              color: '#ffffff',
              fontSize: '72px',
              fontWeight: 800,
              padding: '20px 40px',
              borderRadius: '20px',
            }}
          >
            {profile.shipcred_score}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: '#1f2937',
              fontSize: '24px',
            }}
          >
            <span>ShipCred Score</span>
            <span style={{ fontSize: '20px', color: '#6b7280' }}>
              {tierInfo.emoji} {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: '#9ca3af', fontSize: '18px' }}>
            shipcred.io/{profile.username}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '18px' }}>
            Talk is cheap. Commits aren&apos;t.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
