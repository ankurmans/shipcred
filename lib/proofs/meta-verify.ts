/**
 * Meta tag ownership verification.
 *
 * Flow:
 * 1. User adds an external proof URL
 * 2. System generates a unique verification code: sc_<random>
 * 3. User adds <meta name="gtmcommit-verify" content="sc_abc123"> to their site
 * 4. User clicks "Verify ownership"
 * 5. System fetches the URL and checks for the meta tag
 * 6. If found → ownership_verified = true, proof upgraded to Tier 1
 */

import { safeFetch } from '@/lib/url-validation';

export function generateVerificationCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = 'sc_';
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface MetaVerifyResult {
  found: boolean;
  method: 'meta_tag' | 'backlink';
  checkedAt: string;
}

export async function verifyMetaTag(url: string, expectedCode: string): Promise<MetaVerifyResult> {
  try {
    const response = await safeFetch(url, {
      headers: { 'User-Agent': 'GTM Commit/1.0 (ownership-verification)' },
    });

    if (!response.ok) {
      return { found: false, method: 'meta_tag', checkedAt: new Date().toISOString() };
    }

    const html = await response.text();

    // Check for <meta name="gtmcommit-verify" content="sc_abc123">
    // Handle various quoting styles and attribute orders
    const patterns = [
      // name="gtmcommit-verify" content="CODE"
      new RegExp(`<meta[^>]*name=["']gtmcommit-verify["'][^>]*content=["']${escapeRegex(expectedCode)}["'][^>]*/?>`, 'i'),
      // content="CODE" name="gtmcommit-verify"
      new RegExp(`<meta[^>]*content=["']${escapeRegex(expectedCode)}["'][^>]*name=["']gtmcommit-verify["'][^>]*/?>`, 'i'),
    ];

    const metaFound = patterns.some(p => p.test(html));
    if (metaFound) {
      return { found: true, method: 'meta_tag', checkedAt: new Date().toISOString() };
    }

    // Also check for a gtmcommit.com backlink (badge embed or plain link)
    // Matches: <a href="https://gtmcommit.com/..."> anywhere on the page
    const backlinkFound = /href=["']https?:\/\/(www\.)?gtmcommit\.com(\/[^"']*)?["']/i.test(html);
    if (backlinkFound) {
      return { found: true, method: 'backlink', checkedAt: new Date().toISOString() };
    }

    return { found: false, method: 'meta_tag', checkedAt: new Date().toISOString() };
  } catch {
    return { found: false, method: 'meta_tag', checkedAt: new Date().toISOString() };
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
