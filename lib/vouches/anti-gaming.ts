import type { Vouch } from '@/types';

// ============================================================
// 9. Vouch Ring Detection
// ============================================================

interface VouchRingResult {
  mutualPairs: [string, string][];
  hasSuspiciousPattern: boolean;
}

export function detectVouchRing(vouches: Vouch[]): VouchRingResult {
  // Build directed graph
  const graph = new Map<string, Set<string>>();

  for (const vouch of vouches) {
    if (!graph.has(vouch.voucher_id)) graph.set(vouch.voucher_id, new Set());
    graph.get(vouch.voucher_id)!.add(vouch.vouchee_id);
  }

  // Detect mutual vouches: A→B and B→A
  const mutualPairs: [string, string][] = [];
  const seen = new Set<string>();

  for (const [voucher, vouchees] of graph) {
    for (const vouchee of vouchees) {
      const pairKey = [voucher, vouchee].sort().join('-');
      if (seen.has(pairKey)) continue;

      if (graph.get(vouchee)?.has(voucher)) {
        mutualPairs.push([voucher, vouchee]);
        seen.add(pairKey);
      }
    }
  }

  return { mutualPairs, hasSuspiciousPattern: mutualPairs.length > 0 };
}

// Calculate effective vouch value considering mutual penalty
export function getVouchValue(
  voucherId: string,
  voucheeId: string,
  allVouches: Vouch[],
  baseValue: number = 15
): number {
  // Check if mutual
  const isMutual = allVouches.some(
    v => v.voucher_id === voucheeId && v.vouchee_id === voucherId
  );
  return isMutual ? baseValue * 0.5 : baseValue;
}

// ============================================================
// 10. Throwaway Account Prevention
// ============================================================

interface VouchEligibility {
  canVouch: boolean;
  reason?: string;
}

export function canUserVouch(voucher: {
  gtmcommit_score: number;
  created_at: string;
  is_verified: boolean;
  github_username: string | null;
}): VouchEligibility {
  // Must have ≥50 pts (Shipper tier)
  if (voucher.gtmcommit_score < 50) {
    return { canVouch: false, reason: 'You need at least 50 GTM Commit points to vouch for others.' };
  }

  // Account must be >7 days old
  const daysSinceCreation = (Date.now() - new Date(voucher.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 7) {
    return { canVouch: false, reason: 'Your account must be at least 7 days old to vouch.' };
  }

  // Must have at least 1 verified proof source
  if (!voucher.is_verified && !voucher.github_username) {
    return { canVouch: false, reason: 'You need at least one verified proof source to vouch.' };
  }

  return { canVouch: true };
}

// ============================================================
// 11. Company Stacking Cap
// ============================================================

export function applyCompanyVouchCap(
  vouches: { voucher_id: string; voucher_company: string | null }[],
  maxPerCompany: number = 3
): string[] {
  const companyCount = new Map<string, number>();
  const validVoucherIds: string[] = [];

  for (const v of vouches) {
    const company = v.voucher_company?.toLowerCase().trim();
    if (!company) {
      // No company = no cap applied
      validVoucherIds.push(v.voucher_id);
      continue;
    }

    const current = companyCount.get(company) || 0;
    if (current >= maxPerCompany) continue;

    companyCount.set(company, current + 1);
    validVoucherIds.push(v.voucher_id);
  }

  return validVoucherIds;
}

// ============================================================
// 15. New Account Restrictions
// ============================================================

export function isNewAccount(createdAt: string): boolean {
  const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation < 7;
}
