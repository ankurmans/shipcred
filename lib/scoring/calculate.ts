import type { ScoreBreakdown } from '@/types';

interface ProfileData {
  commits: { ai_tool_detected: string | null; committed_at: string }[];
  portfolioItems: { vouch_count: number }[];
  vouchCount: number;
  toolDeclarations: { is_verified: boolean }[];
  externalProofs: { verification_status: string; source_type: string }[];
}

function countActiveWeeks(commits: { committed_at: string }[]): number {
  const weeks = new Set<string>();
  for (const c of commits) {
    const d = new Date(c.committed_at);
    const year = d.getFullYear();
    const week = Math.ceil(
      ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );
    weeks.add(`${year}-${week}`);
  }
  return weeks.size;
}

export function calculateShipCredScore(data: ProfileData): ScoreBreakdown & { total: number } {
  // === GITHUB SCORE (0-500) ===
  let github = 0;

  const aiCommits = data.commits.filter(c => c.ai_tool_detected).length;
  github += Math.min(300, Math.round(100 * Math.log2(aiCommits + 1)));

  const uniqueTools = new Set(
    data.commits.filter(c => c.ai_tool_detected).map(c => c.ai_tool_detected)
  );
  github += Math.min(100, uniqueTools.size * 25);

  const activeWeeks = countActiveWeeks(data.commits);
  github += Math.min(100, activeWeeks * 5);

  github = Math.min(500, github);

  // === PORTFOLIO SCORE (0-250) ===
  let portfolio = 0;

  portfolio += Math.min(150, data.portfolioItems.length * 30);

  const vouchedItems = data.portfolioItems.filter(p => p.vouch_count > 0);
  portfolio += Math.min(100, vouchedItems.length * 25);

  // External proofs
  const verifiedProofs = data.externalProofs.filter(p => p.verification_status === 'verified');
  const platformProofs = verifiedProofs.filter(p => p.source_type !== 'custom_url');
  const urlProofs = verifiedProofs.filter(p => p.source_type === 'custom_url');

  portfolio += Math.min(75, platformProofs.length * 25);
  portfolio += Math.min(45, urlProofs.length * 15);

  const unverifiedProofs = data.externalProofs.filter(p => p.verification_status === 'pending');
  portfolio += Math.min(20, unverifiedProofs.length * 5);

  portfolio = Math.min(250, portfolio);

  // === VOUCH SCORE (0-150) ===
  const vouches = Math.min(150, data.vouchCount * 15);

  // === TOOL SCORE (0-100) ===
  let tools = 0;

  const verifiedTools = data.toolDeclarations.filter(t => t.is_verified);
  tools += Math.min(60, verifiedTools.length * 20);

  const declaredOnly = data.toolDeclarations.filter(t => !t.is_verified);
  tools += Math.min(40, declaredOnly.length * 5);

  tools = Math.min(100, tools);

  const total = github + portfolio + vouches + tools;

  return { github, portfolio, vouches, tools, total };
}

export function scoreToTier(score: number): string {
  if (score >= 750) return 'legend';
  if (score >= 500) return 'captain';
  if (score >= 250) return 'builder';
  if (score >= 50) return 'shipper';
  return 'unranked';
}
