import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const TIER_COLORS: Record<string, string> = {
  legend: '#F59E0B',
  captain: '#FF5C00',
  builder: '#6366F1',
  shipper: '#10B981',
  unranked: '#9CA3AF',
};

function generateBadgeSVG(score: number, tier: string, username: string): string {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const tierColor = TIER_COLORS[tier] || TIER_COLORS.unranked;

  const leftText = 'GTM Commit';
  const rightText = `${score} · ${tierLabel}`;
  const leftWidth = 90;
  const rightWidth = 85;
  const totalWidth = leftWidth + rightWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="GTM Commit: ${score} ${tierLabel}">
  <title>GTM Commit: ${score} ${tierLabel}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#555"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${tierColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${leftText}</text>
    <text x="${leftWidth / 2}" y="14">${leftText}</text>
    <text aria-hidden="true" x="${leftWidth + rightWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${rightText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`;
}

function sanitizeSvgText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!USERNAME_REGEX.test(username)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('gtmcommit_score, gtmcommit_tier')
    .eq('username', username)
    .single();

  if (!profile) {
    return new NextResponse('Not found', { status: 404 });
  }

  const svg = generateBadgeSVG(profile.gtmcommit_score, profile.gtmcommit_tier, sanitizeSvgText(username));

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
