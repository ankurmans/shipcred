import type { ExternalProof } from '@/types';
import { safeFetch } from '@/lib/url-validation';

// ============================================================
// 6. Blank Template Deployment Detection
// ============================================================

const STARTER_SIGNATURES = [
  'Welcome to Next.js',
  'Get started by editing',
  'Create Next App',
  'Powered by Vercel',
  'Welcome to Vite',
  'Hello from Bolt',
  'Welcome to React',
  'Congratulations!',
  'This is a [Next.js]',
];

export interface ContentCheck {
  valid: boolean;
  reason?: string;
}

export async function verifyDeploymentContent(url: string): Promise<ContentCheck> {
  try {
    const response = await safeFetch(url, {
      headers: { 'User-Agent': 'GTM Commit/1.0 (proof-verification)' },
    });
    if (!response.ok) return { valid: false, reason: 'url_not_reachable' };

    const html = await response.text();

    // Must have >1KB of actual content
    if (html.length < 1024) return { valid: false, reason: 'insufficient_content' };

    // Check for unmodified starter template signatures
    const isStarter = STARTER_SIGNATURES.some(sig => html.includes(sig));
    if (isStarter) return { valid: false, reason: 'unmodified_template' };

    return { valid: true };
  } catch {
    return { valid: false, reason: 'fetch_failed' };
  }
}

// ============================================================
// 7. Recycled URL Deduplication
// ============================================================

export function deduplicateProofs(proofs: ExternalProof[]): ExternalProof[] {
  const domainGroups = new Map<string, ExternalProof[]>();

  for (const proof of proofs) {
    try {
      const root = new URL(proof.project_url).hostname.replace(/^www\./, '');
      if (!domainGroups.has(root)) domainGroups.set(root, []);
      domainGroups.get(root)!.push(proof);
    } catch {
      // Invalid URL — keep it (will fail verification later)
      domainGroups.set(proof.project_url, [proof]);
    }
  }

  // Keep only the highest-scoring proof per root domain
  return Array.from(domainGroups.values()).map(group =>
    group.sort((a, b) => b.proof_score - a.proof_score)[0]
  );
}

// ============================================================
// 8. Re-verification (for cron job)
// ============================================================

export interface ReVerificationResult {
  proof_id: string;
  still_live: boolean;
  checked_at: string;
}

export async function reVerifyProof(proofUrl: string): Promise<boolean> {
  try {
    const response = await safeFetch(proofUrl, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// Deployment age check (24hr minimum)
// ============================================================

export function isOldEnoughToVerify(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return hoursDiff >= 24;
}
