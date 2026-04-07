export interface CertVerification {
  verification_status: 'auto_verified' | 'pending';
  verification_method: string | null;
  issuer: string;
  points: number;
}

const RECOGNIZED_CERT_DOMAINS: Record<string, { issuer: string; points: number }> = {
  'credly.com': { issuer: 'credly', points: 40 },
  'credentials.openai.com': { issuer: 'openai', points: 40 },
  'learn.anthropic.com': { issuer: 'anthropic', points: 40 },
  'anthropic.skilljar.com': { issuer: 'anthropic', points: 40 },
  'skilljar.com': { issuer: 'skilljar', points: 30 },
  'clay.com': { issuer: 'clay', points: 30 },
  'academy.hubspot.com': { issuer: 'hubspot', points: 20 },
  'app.hubspot.com/academy': { issuer: 'hubspot', points: 20 },
  'gtmaiacademy.com': { issuer: 'gtm_ai_academy', points: 20 },
  'n8n.io': { issuer: 'n8n', points: 20 },
  'academy.make.com': { issuer: 'make', points: 20 },
  'grow.google': { issuer: 'google', points: 20 },
  'cloudskillsboost.google': { issuer: 'google', points: 20 },
  'learn.microsoft.com': { issuer: 'microsoft', points: 20 },
  'aws.amazon.com/certification': { issuer: 'aws', points: 20 },
  'coursera.org': { issuer: 'coursera', points: 15 },
  'udemy.com': { issuer: 'udemy', points: 10 },
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
  anthropic: 40,
  credly: 40,
  skilljar: 30,
  clay: 30,
  hubspot: 20,
  gtm_ai_academy: 20,
  pavilion: 20,
  n8n: 20,
  make: 20,
  google: 20,
  microsoft: 20,
  aws: 20,
  coursera: 15,
  pma: 15,
  udemy: 10,
  other: 10,
};
