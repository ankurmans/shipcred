'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuChevronDown, LuChevronUp, LuArrowRight, LuShield, LuUsers, LuPenLine, LuZap, LuInfo } from 'react-icons/lu';
import { SCORE_DETAIL_META, TIER_LABELS } from '@/lib/gamification/score-labels';
import type { ScoreBreakdown } from '@/types';

const TIER_ICONS = {
  1: LuShield,
  2: LuUsers,
  3: LuPenLine,
} as const;

const TIER_GRADIENTS = {
  1: 'from-green-500 to-emerald-600',
  2: 'from-blue-500 to-indigo-600',
  3: 'from-amber-500 to-orange-600',
} as const;

const TIER_BG = {
  1: 'bg-green-50 border-green-200',
  2: 'bg-blue-50 border-blue-200',
  3: 'bg-amber-50 border-amber-200',
} as const;

const TIER_BAR_BG = {
  1: 'bg-green-100',
  2: 'bg-blue-100',
  3: 'bg-amber-100',
} as const;

const TIER_BAR_FILL = {
  1: 'bg-gradient-to-r from-green-400 to-emerald-500',
  2: 'bg-gradient-to-r from-blue-400 to-indigo-500',
  3: 'bg-gradient-to-r from-amber-400 to-orange-500',
} as const;

export default function ScoreBreakdownDrawer({ breakdown }: { breakdown: ScoreBreakdown }) {
  const [open, setOpen] = useState(false);
  const detail = breakdown.detail;

  const entries = Object.entries(SCORE_DETAIL_META) as [keyof typeof detail, typeof SCORE_DETAIL_META[keyof typeof detail]][];

  const tiers = [1, 2, 3] as const;

  // Calculate tier totals
  const tierTotals = tiers.map(tier => {
    const tierEntries = entries.filter(([, meta]) => meta.tier === tier);
    const sum = tierEntries.reduce((acc, [key]) => acc + (detail[key] || 0), 0);
    const max = tier === 1 ? 600 : tier === 2 ? 250 : 150;
    return { sum, max };
  });

  return (
    <div className="bg-surface-secondary rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
            <LuZap size={16} className="text-white" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-fg-primary block">Score Breakdown</span>
            <span className="text-xs text-fg-muted">{breakdown.total} / 1,000 pts across {Object.values(detail).filter(v => v > 0).length} categories</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini tier summary pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {tiers.map((tier, i) => (
              <span key={tier} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tier === 1 ? 'bg-green-100 text-green-700' :
                tier === 2 ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {tierTotals[i].sum}
              </span>
            ))}
          </div>
          {open ? <LuChevronUp size={18} className="text-fg-muted" /> : <LuChevronDown size={18} className="text-fg-muted" />}
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
        <div className="px-5 pb-5 space-y-4">
          {tiers.map((tier, tierIdx) => {
            const tierEntries = entries.filter(([, meta]) => meta.tier === tier);
            const tierLabel = TIER_LABELS[tier];
            const TierIcon = TIER_ICONS[tier];
            const { sum, max } = tierTotals[tierIdx];
            const tierPct = Math.min(100, (sum / max) * 100);

            return (
              <div key={tier} className={`rounded-xl border p-4 ${TIER_BG[tier]}`}>
                {/* Tier header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${TIER_GRADIENTS[tier]} flex items-center justify-center`}>
                      <TierIcon size={14} className="text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-fg-primary">{tierLabel.label}</span>
                      <span className="text-xs text-fg-muted ml-2">cap {max}</span>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${tierLabel.color}`}>{sum}<span className="text-xs font-normal text-fg-muted">/{max}</span></span>
                </div>

                {/* Tier overall bar */}
                <div className={`w-full h-2 ${TIER_BAR_BG[tier]} rounded-full overflow-hidden mb-3`} role="progressbar" aria-valuenow={sum} aria-valuemin={0} aria-valuemax={max} aria-label={`${tierLabel.label}: ${sum} of ${max}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${TIER_BAR_FILL[tier]}`}
                    style={{ width: `${tierPct}%` }}
                  />
                </div>

                {/* Individual score rows */}
                <div className="space-y-2">
                  {tierEntries.map(([key, meta]) => {
                    const value = detail[key] || 0;
                    const pct = meta.maxValue > 0 ? Math.min(100, (value / meta.maxValue) * 100) : 0;
                    const isZero = value === 0;
                    const isMaxed = value >= meta.maxValue;

                    return (
                      <div key={key} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isMaxed ? 'bg-white/80' : isZero ? 'bg-white/40' : 'bg-white/60'
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${isZero ? 'text-fg-muted' : 'text-fg-secondary'}`}>{meta.label}</span>
                            <span className={`text-xs font-mono ${isMaxed ? 'text-green-600 font-bold' : 'text-fg-muted'}`}>
                              {value}<span className="text-fg-muted/50">/{meta.maxValue}</span>
                            </span>
                          </div>
                          <div className={`w-full h-1.5 ${TIER_BAR_BG[tier]} rounded-full overflow-hidden`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={meta.maxValue}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMaxed ? 'bg-green-500' : TIER_BAR_FILL[tier]
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-right shrink-0">
                          {isMaxed ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">MAX</span>
                          ) : isZero ? (
                            <a href={meta.boostHref} className="text-[10px] font-bold text-brand hover:text-brand-dark inline-flex items-center gap-0.5">
                              Start <LuArrowRight size={9} />
                            </a>
                          ) : (
                            <a href={meta.boostHref} className="text-[10px] font-medium text-fg-muted hover:text-brand inline-flex items-center gap-0.5">
                              +{meta.maxValue - value} <LuArrowRight size={9} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <Link href="/scoring" className="flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-dark font-medium pt-2 transition-colors">
            <LuInfo size={12} /> How scoring works
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
