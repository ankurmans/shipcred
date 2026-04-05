import { TIERS } from '@/lib/scoring/tiers';
import TierIcon from '@/components/shared/TierIcon';
import type { GtmCommitTier } from '@/types';

const TIER_ORDER: GtmCommitTier[] = ['unranked', 'shipper', 'builder', 'captain', 'legend'];

export default function TierProgressBar({ score, tier }: { score: number; tier: GtmCommitTier }) {
  const currentIdx = TIER_ORDER.indexOf(tier);
  const isMaxTier = tier === 'legend';

  // Find next tier
  const nextTier = isMaxTier ? null : TIER_ORDER[currentIdx + 1];
  const nextTierInfo = nextTier ? TIERS[nextTier] : null;
  const currentTierInfo = TIERS[tier];

  // Calculate progress
  const currentMin = currentTierInfo.minScore;
  const nextMin = nextTierInfo?.minScore || 1000;
  const range = nextMin - currentMin;
  const progress = range > 0 ? Math.min(100, ((score - currentMin) / range) * 100) : 100;
  const pointsNeeded = nextMin - score;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TierIcon tier={tier} size={16} />
          <span className="text-xs font-semibold capitalize">{currentTierInfo.label}</span>
        </div>
        {nextTier ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold capitalize text-fg-muted">{TIERS[nextTier].label}</span>
            <TierIcon tier={nextTier} size={16} />
          </div>
        ) : (
          <span className="text-xs font-bold text-amber-600">MAX TIER</span>
        )}
      </div>
      <div className="w-full h-2.5 bg-surface-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={currentMin} aria-valuemax={nextMin} aria-label={`Tier progress: ${score} of ${nextMin}`}>
        <div
          className="h-full rounded-full gradient-brand transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextTier && (
        <p className="text-xs text-fg-muted mt-1.5">
          <span className="font-semibold text-brand">{pointsNeeded}</span> more points to {TIERS[nextTier].label}
        </p>
      )}
    </div>
  );
}
