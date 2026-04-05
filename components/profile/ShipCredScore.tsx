import type { ShipCredTier, ScoreBreakdown } from '@/types';
import { getTierInfo } from '@/lib/scoring/tiers';

interface ShipCredScoreProps {
  score: number;
  tier: ShipCredTier;
  breakdown?: ScoreBreakdown;
  size?: 'sm' | 'lg';
}

export default function ShipCredScore({ score, tier, breakdown, size = 'lg' }: ShipCredScoreProps) {
  const tierInfo = getTierInfo(tier);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div
          className={`${
            size === 'lg' ? 'text-6xl px-6 py-3' : 'text-3xl px-4 py-2'
          } font-extrabold text-primary-content bg-primary rounded-2xl font-[family-name:var(--font-dm-sans)]`}
        >
          {score}
        </div>
        <div>
          <div className={`${size === 'lg' ? 'text-lg' : 'text-sm'} font-semibold`}>
            ShipCred Score
          </div>
          <span className={`badge ${tierInfo.color} gap-1`}>
            {tierInfo.emoji} {tierInfo.label}
          </span>
        </div>
      </div>

      {breakdown && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <ScoreBar label="GitHub" value={breakdown.github} max={500} />
          <ScoreBar label="Portfolio" value={breakdown.portfolio} max={250} />
          <ScoreBar label="Vouches" value={breakdown.vouches} max={150} />
          <ScoreBar label="Tools" value={breakdown.tools} max={100} />
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between text-xs text-base-content/60">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <progress className="progress progress-primary h-1.5" value={pct} max={100} />
    </div>
  );
}
