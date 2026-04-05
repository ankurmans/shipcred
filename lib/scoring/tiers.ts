import type { GtmCommitTier } from '@/types';

interface TierInfo {
  name: string;
  label: string;
  minScore: number;
  iconName: 'square' | 'package' | 'hammer' | 'rocket' | 'trophy';
}

export const TIERS: Record<GtmCommitTier, TierInfo> = {
  unranked: { name: 'unranked', label: 'Unranked', minScore: 0, iconName: 'square' },
  shipper: { name: 'shipper', label: 'Shipper', minScore: 50, iconName: 'package' },
  builder: { name: 'builder', label: 'Builder', minScore: 250, iconName: 'hammer' },
  captain: { name: 'captain', label: 'Captain', minScore: 500, iconName: 'rocket' },
  legend: { name: 'legend', label: 'Legend', minScore: 750, iconName: 'trophy' },
};

export function getTierInfo(tier: GtmCommitTier): TierInfo {
  return TIERS[tier] || TIERS.unranked;
}
