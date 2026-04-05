'use client';

import { useState } from 'react';
import { LuChevronDown, LuChevronUp, LuArrowRight } from 'react-icons/lu';
import { SCORE_DETAIL_META, TIER_LABELS } from '@/lib/gamification/score-labels';
import type { ScoreBreakdown } from '@/types';

export default function ScoreBreakdownDrawer({ breakdown }: { breakdown: ScoreBreakdown }) {
  const [open, setOpen] = useState(false);
  const detail = breakdown.detail;

  const entries = Object.entries(SCORE_DETAIL_META) as [keyof typeof detail, typeof SCORE_DETAIL_META[keyof typeof detail]][];

  // Group by tier
  const tiers = [1, 2, 3] as const;

  return (
    <div className="bg-surface-secondary rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-muted transition-colors"
      >
        <span className="text-sm font-semibold text-fg-primary">Score Details</span>
        {open ? <LuChevronUp size={16} className="text-fg-muted" /> : <LuChevronDown size={16} className="text-fg-muted" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5">
          {tiers.map((tier) => {
            const tierEntries = entries.filter(([, meta]) => meta.tier === tier);
            const tierLabel = TIER_LABELS[tier];

            return (
              <div key={tier}>
                <div className={`text-xs font-semibold mb-2 ${tierLabel.color}`}>
                  {tierLabel.label}
                </div>
                <div className="space-y-2">
                  {tierEntries.map(([key, meta]) => {
                    const value = detail[key] || 0;
                    const pct = meta.maxValue > 0 ? Math.min(100, (value / meta.maxValue) * 100) : 0;
                    const isZero = value === 0;

                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-fg-secondary truncate">{meta.label}</span>
                            <span className="text-xs font-mono text-fg-muted">{value}/{meta.maxValue}</span>
                          </div>
                          <div className="w-full h-1 bg-surface-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${tierLabel.bg}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        {isZero ? (
                          <a
                            href={meta.boostHref}
                            className="text-[10px] font-semibold text-brand hover:text-brand-dark flex items-center gap-0.5 shrink-0"
                          >
                            Start <LuArrowRight size={10} />
                          </a>
                        ) : value < meta.maxValue ? (
                          <a
                            href={meta.boostHref}
                            className="text-[10px] font-semibold text-fg-muted hover:text-brand flex items-center gap-0.5 shrink-0"
                          >
                            Boost <LuArrowRight size={10} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-green-600 font-semibold shrink-0">Max</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
