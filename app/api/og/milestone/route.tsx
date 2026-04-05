import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Builder';
  const score = searchParams.get('score') || '0';
  const milestone = searchParams.get('milestone') || 'Achievement Unlocked!';
  const icon = searchParams.get('icon') || 'Achievement';
  const tier = searchParams.get('tier') || 'shipper';

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
          background: 'linear-gradient(135deg, #FF5C00, #FF8533)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            borderRadius: '32px',
            padding: '60px 80px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#FF5C00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '32px',
              fontWeight: 800,
            }}
          >
            {icon.charAt(0).toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#1A1A1A',
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            {milestone}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666',
              marginTop: '12px',
            }}
          >
            {name} — Score: {score}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px',
              fontSize: '18px',
              color: '#FF5C00',
              fontWeight: 600,
            }}
          >
            GTM Commit — Talk is cheap. Commits aren&apos;t.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
