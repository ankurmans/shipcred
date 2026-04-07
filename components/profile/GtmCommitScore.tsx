import type { GtmCommitTier, ScoreBreakdown } from '@/types';
import { TierBadge } from '@/components/shared/TierIcon';

interface GtmCommitScoreProps {
  score: number;
  tier: GtmCommitTier;
  breakdown?: ScoreBreakdown | Record<string, unknown>;
  size?: 'sm' | 'lg';
}

// Safely extract tier breakdown from stored data (which may be legacy or v2 format)
function parseTierBreakdown(raw: ScoreBreakdown | Record<string, unknown> | undefined): {
  tier1: number; tier2: number; tier3: number;
  detail?: ScoreBreakdown['detail'];
} | null {
  if (!raw) return null;
  if ('tier1' in raw && typeof raw.tier1 === 'number') {
    return raw as ScoreBreakdown;
  }
  // Legacy format — approximate
  const legacy = raw as { github?: number; portfolio?: number; vouches?: number; tools?: number };
  if ('github' in legacy) {
    return {
      tier1: (legacy.github || 0) + (legacy.tools || 0),
      tier2: legacy.vouches || 0,
      tier3: legacy.portfolio || 0,
    };
  }
  return null;
}

const TIER_LABELS = [
  { key: 'tier1', label: 'Auto-Verified', max: 700, color: 'bg-green-500' },
  { key: 'tier2', label: 'Community Verified', max: 200, color: 'bg-blue-500' },
  { key: 'tier3', label: 'Self-Reported', max: 100, color: 'bg-amber-500' },
] as const;

const DETAIL_LABELS: { key: keyof ScoreBreakdown['detail']; label: string; tier: number }[] = [
  { key: 'githubCommits', label: 'GitHub AI Commits', tier: 1 },
  { key: 'platformDeploys', label: 'Platform Deployments', tier: 1 },
  { key: 'certsTier1', label: 'Certifications', tier: 1 },
  { key: 'toolDiversity', label: 'Tool Diversity', tier: 1 },
  { key: 'consistency', label: 'Consistency', tier: 1 },
  { key: 'vouchedPortfolio', label: 'Vouched Projects', tier: 2 },
  { key: 'vouchedUploads', label: 'Vouched Uploads', tier: 2 },
  { key: 'vouchedVideos', label: 'Vouched Videos', tier: 2 },
  { key: 'vouchedContent', label: 'Vouched Content', tier: 2 },
  { key: 'certsTier2', label: 'Vouched Certs', tier: 2 },
  { key: 'unvouchedPortfolio', label: 'Projects', tier: 3 },
  { key: 'unvouchedUploads', label: 'Uploaded Files', tier: 3 },
  { key: 'toolDeclarations', label: 'Tool Declarations', tier: 3 },
  { key: 'profileCompleteness', label: 'Profile Completeness', tier: 3 },
];

export default function GtmCommitScore({ score, tier, breakdown, size = 'lg' }: GtmCommitScoreProps) {
  const parsed = parseTierBreakdown(breakdown);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`${size === 'lg' ? 'text-5xl sm:text-6xl px-5 sm:px-6 py-2.5 sm:py-3' : 'text-3xl px-4 py-2'} font-display font-bold text-white gradient-brand rounded-2xl`}>
          {score}
        </div>
        <div>
          <div className={`${size === 'lg' ? 'text-base sm:text-lg' : 'text-sm'} font-semibold`}>GTM Commit Score</div>
          <span className="text-sm"><TierBadge tier={tier} /></span>
        </div>
      </div>
      {parsed && (
        <div className="space-y-2 mt-2">
          {TIER_LABELS.map(t => {
            const value = parsed[t.key];
            return (
              <div key={t.key} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs text-fg-muted">
                  <span>{t.label}</span>
                  <span>{value}/{t.max}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${Math.min(100, (value / t.max) * 100)}%` }} />
                </div>
              </div>
            );
          })}

          {/* Detailed breakdown if available */}
          {parsed.detail && size === 'lg' && (
            <details className="mt-3">
              <summary className="text-xs text-fg-muted cursor-pointer hover:text-fg-secondary">
                View detailed breakdown
              </summary>
              <div className="mt-2 space-y-1.5">
                {DETAIL_LABELS.map(d => {
                  const val = parsed.detail![d.key];
                  if (val === 0) return null;
                  return (
                    <div key={d.key} className="flex justify-between text-xs">
                      <span className="text-fg-muted">{d.label}</span>
                      <span className="text-fg-secondary font-mono">+{val}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
