import type { ShipCredTier } from '@/types';

interface TierInfo {
  name: string;
  emoji: string;
  label: string;
  minScore: number;
  color: string;
}

export const TIERS: Record<ShipCredTier, TierInfo> = {
  unranked: { name: 'unranked', emoji: '⬜', label: 'Unranked', minScore: 0, color: 'badge-ghost' },
  shipper: { name: 'shipper', emoji: '📦', label: 'Shipper', minScore: 50, color: 'badge-info' },
  builder: { name: 'builder', emoji: '🔨', label: 'Builder', minScore: 250, color: 'badge-warning' },
  captain: { name: 'captain', emoji: '🚀', label: 'Captain', minScore: 500, color: 'badge-secondary' },
  legend: { name: 'legend', emoji: '🏆', label: 'Legend', minScore: 750, color: 'badge-accent' },
};

export function getTierInfo(tier: ShipCredTier): TierInfo {
  return TIERS[tier] || TIERS.unranked;
}
