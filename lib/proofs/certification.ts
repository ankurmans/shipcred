export interface CertVerification {
  verification_status: 'auto_verified' | 'pending';
  verification_method: string | null;
  issuer: string;
  points: number;
}

const RECOGNIZED_CERT_DOMAINS: Record<string, { issuer: string; points: number }> = {
  'credly.com': { issuer: 'credly', points: 40 },
  'credentials.openai.com': { issuer: 'openai', points: 40 },
  'clay.com': { issuer: 'clay', points: 30 },
  'academy.hubspot.com': { issuer: 'hubspot', points: 20 },
  'app.hubspot.com/academy': { issuer: 'hubspot', points: 20 },
  'gtmaiacademy.com': { issuer: 'gtm_ai_academy', points: 20 },
  'n8n.io': { issuer: 'n8n', points: 20 },
  'academy.make.com': { issuer: 'make', points: 20 },
  'productmarketingalliance.com': { issuer: 'pma', points: 15 },
};

export function verifyCertification(url: string): CertVerification {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const fullUrl = url.toLowerCase();

    const match = Object.entries(RECOGNIZED_CERT_DOMAINS).find(
      ([domain]) => hostname.includes(domain) || fullUrl.includes(domain)
    );

    if (match) {
      return {
        verification_status: 'auto_verified',
        verification_method: 'domain_match',
        issuer: match[1].issuer,
        points: match[1].points,
      };
    }
  } catch {
    // Invalid URL
  }

  return {
    verification_status: 'pending',
    verification_method: null,
    issuer: 'other',
    points: 10,
  };
}

export function detectIssuerFromUrl(url: string): string {
  const result = verifyCertification(url);
  return result.issuer;
}

export const CERT_POINTS: Record<string, number> = {
  openai: 40,
  credly: 40,
  clay: 30,
  hubspot: 20,
  gtm_ai_academy: 20,
  pavilion: 20,
  n8n: 20,
  make: 20,
  pma: 15,
  other: 10,
};
