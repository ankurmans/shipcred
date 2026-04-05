'use client';

import { LuSquare, LuPackage, LuHammer, LuRocket, LuTrophy } from 'react-icons/lu';
import type { GtmCommitTier } from '@/types';
import { getTierInfo } from '@/lib/scoring/tiers';

const ICON_MAP = {
  square: LuSquare,
  package: LuPackage,
  hammer: LuHammer,
  rocket: LuRocket,
  trophy: LuTrophy,
} as const;

export default function TierIcon({ tier, size = 16, className = '' }: { tier: GtmCommitTier; size?: number; className?: string }) {
  const info = getTierInfo(tier);
  const Icon = ICON_MAP[info.iconName];
  return <Icon size={size} className={className} />;
}

export function TierBadge({ tier }: { tier: GtmCommitTier }) {
  const info = getTierInfo(tier);
  const Icon = ICON_MAP[info.iconName];
  return (
    <span className="inline-flex items-center gap-1 text-brand">
      <Icon size={14} />
      <span>{info.label}</span>
    </span>
  );
}
