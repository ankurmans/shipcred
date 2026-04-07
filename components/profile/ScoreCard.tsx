'use client';

import { useEffect, useRef, useState } from 'react';
import { LuFlame } from 'react-icons/lu';
import type { GtmCommitTier, ScoreBreakdown, ToolDeclaration } from '@/types';
import { TierBadge } from '@/components/shared/TierIcon';
import Avatar from '@/components/shared/Avatar';
import ToolBadges from './ToolBadges';

interface ScoreCardProps {
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string | null;
    company: string | null;
    gtmcommit_score: number;
    gtmcommit_tier: GtmCommitTier;
    score_breakdown: ScoreBreakdown | Record<string, unknown>;
    is_verified: boolean;
    current_streak?: number;
  };
  tools: ToolDeclaration[];
  appUrl: string;
  showHeader?: boolean;
}

// Tier thresholds for "next tier" nudge
const TIER_THRESHOLDS: { tier: GtmCommitTier; label: string; min: number }[] = [
  { tier: 'legend', label: 'Legend', min: 750 },
  { tier: 'captain', label: 'Captain', min: 500 },
  { tier: 'builder', label: 'Builder', min: 250 },
  { tier: 'shipper', label: 'Shipper', min: 50 },
];

function getNextTier(score: number): { label: string; pointsNeeded: number; progress: number } | null {
  // Find the lowest threshold the score hasn't reached yet
  // Iterate from lowest (Shipper 50) to highest (Legend 750)
  const sorted = [...TIER_THRESHOLDS].reverse();
  for (const t of sorted) {
    if (score < t.min) {
      const idx = sorted.indexOf(t);
      const prevMin = idx > 0 ? sorted[idx - 1].min : 0;
      return {
        label: t.label,
        pointsNeeded: t.min - score,
        progress: ((score - prevMin) / (t.min - prevMin)) * 100,
      };
    }
  }
  return null; // Already Legend
}

// Parse breakdown safely
function parseTierBreakdown(raw: ScoreBreakdown | Record<string, unknown> | undefined): {
  tier1: number; tier2: number; tier3: number;
  detail?: ScoreBreakdown['detail'];
} | null {
  if (!raw) return null;
  if ('tier1' in raw && typeof raw.tier1 === 'number') {
    return raw as ScoreBreakdown;
  }
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
  { key: 'tier1' as const, label: 'Auto-Verified', max: 700, gradient: 'from-emerald-400 to-emerald-600' },
  { key: 'tier2' as const, label: 'Community Verified', max: 200, gradient: 'from-blue-400 to-blue-600' },
  { key: 'tier3' as const, label: 'Self-Reported', max: 100, gradient: 'from-amber-400 to-amber-500' },
];

const DETAIL_LABELS: { key: keyof ScoreBreakdown['detail']; label: string }[] = [
  { key: 'githubCommits', label: 'GitHub AI Commits' },
  { key: 'platformDeploys', label: 'Platform Deployments' },
  { key: 'certsTier1', label: 'Certifications' },
  { key: 'toolDiversity', label: 'Tool Diversity' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'vouchedPortfolio', label: 'Vouched Projects' },
  { key: 'vouchedUploads', label: 'Vouched Uploads' },
  { key: 'vouchedVideos', label: 'Vouched Videos' },
  { key: 'vouchedContent', label: 'Vouched Content' },
  { key: 'certsTier2', label: 'Vouched Certs' },
  { key: 'unvouchedPortfolio', label: 'Projects' },
  { key: 'unvouchedUploads', label: 'Uploaded Files' },
  { key: 'toolDeclarations', label: 'Tool Declarations' },
  { key: 'profileCompleteness', label: 'Profile Completeness' },
];

// Animated number hook
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const ref = useRef<boolean>(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

// Tier-specific glow classes
function getTierGlow(tier: GtmCommitTier): string {
  switch (tier) {
    case 'legend': return 'shadow-[0_0_40px_rgba(245,158,11,0.2)] ring-2 ring-amber-200/50';
    case 'captain': return 'shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-2 ring-indigo-200/40';
    case 'builder': return 'shadow-[0_0_20px_rgba(255,92,0,0.12)] ring-1 ring-brand-100';
    default: return 'shadow-card';
  }
}

// Tier-specific left accent bar gradient
function getTierAccent(tier: GtmCommitTier): string {
  switch (tier) {
    case 'legend': return 'from-amber-400 via-yellow-300 to-amber-500';
    case 'captain': return 'from-indigo-400 via-blue-400 to-indigo-500';
    case 'builder': return 'from-brand via-brand-light to-brand';
    case 'shipper': return 'from-stone-300 via-stone-400 to-stone-300';
    default: return 'from-gray-200 via-gray-300 to-gray-200';
  }
}

export default function ScoreCard({ profile, tools, appUrl, showHeader = true }: ScoreCardProps) {
  const animatedScore = useCountUp(profile.gtmcommit_score);
  const parsed = parseTierBreakdown(profile.score_breakdown);
  const nextTier = getNextTier(profile.gtmcommit_score);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBarsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const accentGradient = getTierAccent(profile.gtmcommit_tier);

  return (
    <div className={`card-light overflow-hidden ${getTierGlow(profile.gtmcommit_tier)} transition-shadow duration-500`}>
      {/* Tier accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentGradient}`} aria-hidden="true" />

      <div className="p-5 sm:p-6">
      {/* Header: Avatar + Name + Streak (optional — hidden on profile page to avoid duplication) */}
      {showHeader && (
        <div className="flex items-center gap-3 mb-5">
          <Avatar src={profile.avatar_url} alt={profile.display_name} size="lg" isVerified={profile.is_verified} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold truncate">{profile.display_name}</h2>
            <p className="text-xs text-fg-muted truncate">
              @{profile.username}{profile.role && ` · ${profile.role}`}{profile.company && ` @ ${profile.company}`}
            </p>
          </div>
          {Number(profile.current_streak) > 0 && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              Number(profile.current_streak) >= 4 ? 'gradient-brand text-white' : 'bg-surface-muted text-fg-secondary'
            }`}>
              <LuFlame size={12} /> {profile.current_streak}w
            </span>
          )}
        </div>
      )}

      {/* Score — the hero */}
      <div className="mt-5 flex items-center gap-4">
        <div
          className="text-5xl sm:text-6xl font-display font-extrabold text-white gradient-brand rounded-2xl px-5 sm:px-7 py-3 sm:py-4 tabular-nums"
          aria-label={`GTM Commit Score: ${profile.gtmcommit_score}`}
        >
          {animatedScore}
        </div>
        <div>
          <div className="text-base sm:text-lg font-semibold text-fg-primary">GTM Commit Score</div>
          <div className="text-sm mt-0.5"><TierBadge tier={profile.gtmcommit_tier} /></div>
        </div>
      </div>

      {/* Next tier nudge */}
      {nextTier && (
        <div className="mt-4 bg-surface-secondary rounded-xl px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-secondary font-medium">
              <span className="text-brand font-bold">{nextTier.pointsNeeded} pts</span> to {nextTier.label}
            </span>
            <span className="text-fg-faint">{Math.round(nextTier.progress)}%</span>
          </div>
          <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full gradient-brand rounded-full transition-all duration-1000 ease-out"
              style={{ width: barsVisible ? `${Math.min(100, nextTier.progress)}%` : '0%' }}
              role="progressbar"
              aria-valuenow={Math.round(nextTier.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${nextTier.pointsNeeded} points to ${nextTier.label} tier`}
            />
          </div>
        </div>
      )}

      {/* Tier breakdown bars */}
      {parsed && (
        <div className="mt-4 space-y-2.5">
          {TIER_LABELS.map(t => {
            const value = parsed[t.key];
            const pct = Math.min(100, (value / t.max) * 100);
            return (
              <div key={t.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-fg-secondary font-medium">{t.label}</span>
                  <span className="text-fg-muted font-mono">{value}/{t.max}</span>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${t.gradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: barsVisible ? `${pct}%` : '0%' }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={t.max}
                    aria-label={`${t.label}: ${value} of ${t.max}`}
                  />
                </div>
              </div>
            );
          })}

          {/* Detailed breakdown */}
          {parsed.detail && (
            <details className="mt-1">
              <summary className="text-xs text-fg-muted cursor-pointer hover:text-fg-secondary transition-colors">
                View detailed breakdown
              </summary>
              <div className="mt-2 space-y-1.5">
                {DETAIL_LABELS.map(d => {
                  const val = parsed.detail![d.key];
                  if (val === 0) return null;
                  return (
                    <div key={d.key} className="flex justify-between text-xs">
                      <span className="text-fg-muted">{d.label}</span>
                      <span className="text-fg-secondary font-mono font-semibold">+{val}</span>
                    </div>
                  );
                })}
                <a href="/scoring" className="text-xs text-brand hover:text-brand-dark mt-2 inline-block">How scoring works</a>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Tools inside the card */}
      {tools.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-border">
          <ToolBadges tools={tools} />
        </div>
      )}

      {/* Card footer — URL branding */}
      <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
        <span className="text-xs text-fg-faint font-mono">{appUrl.replace(/https?:\/\//, '')}/{profile.username}</span>
        <span className="text-[10px] text-fg-faint uppercase tracking-wider font-semibold">Verified Proof-of-Work</span>
      </div>
      </div>{/* close inner padding wrapper */}
    </div>
  );
}
