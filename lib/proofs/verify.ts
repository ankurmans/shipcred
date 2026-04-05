import { verifyVercel } from './vercel';
import { verifyLovable } from './lovable';
import { verifyReplit } from './replit';
import { verifyBolt } from './bolt';
import { verifyV0 } from './v0';
import { verifyGenericURL } from './url';

export interface ProofVerification {
  source_type: string;
  verification_status: 'verified' | 'failed' | 'pending';
  verification_method: string;
  platform_data: Record<string, unknown>;
}

export function detectPlatform(url: string): string {
  const patterns: [RegExp, string][] = [
    [/\.vercel\.app/i, 'vercel'],
    [/vercel\.com\/.*\/deployments/i, 'vercel'],
    [/lovable\.dev\/projects/i, 'lovable'],
    [/lovable\.app/i, 'lovable'],
    [/bolt\.new/i, 'bolt'],
    [/stackblitz\.com/i, 'bolt'],
    [/v0\.dev/i, 'v0'],
    [/replit\.com\/@/i, 'replit'],
    [/repl\.co/i, 'replit'],
    [/\.railway\.app/i, 'railway'],
    [/\.netlify\.app/i, 'netlify'],
    [/\.fly\.dev/i, 'fly'],
    [/figma\.com\/file/i, 'figma'],
    [/figma\.com\/design/i, 'figma'],
  ];

  for (const [pattern, platform] of patterns) {
    if (pattern.test(url)) return platform;
  }
  return 'custom_url';
}

export async function verifyProof(url: string): Promise<ProofVerification> {
  const platform = detectPlatform(url);

  switch (platform) {
    case 'vercel':
      return verifyVercel(url);
    case 'lovable':
      return verifyLovable(url);
    case 'replit':
      return verifyReplit(url);
    case 'bolt':
      return verifyBolt(url);
    case 'v0':
      return verifyV0(url);
    default:
      return verifyGenericURL(url);
  }
}
