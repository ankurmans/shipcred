'use client';

import { useState } from 'react';
import {
  LuShare2, LuCheck, LuPartyPopper, LuPackage, LuHammer,
  LuRocket, LuTrophy, LuStar, LuTarget, LuFlame, LuHandshake,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_value: string;
  achieved_at: string;
  seen_at: string | null;
  shared_at: string | null;
}

const LABELS: Record<string, (val: string) => string> = {
  tier_upgrade: (v) => `${v.charAt(0).toUpperCase() + v.slice(1)} Tier Unlocked!`,
  score_milestone: (v) => `Score ${v} Reached!`,
  commit_count: (v) => v === '1' ? 'First AI Commit Detected!' : `${v} AI Commits!`,
  first_vouch: () => 'First Vouch Received!',
};

const ICONS: Record<string, (val: string) => IconType> = {
  tier_upgrade: (v) => ({ shipper: LuPackage, builder: LuHammer, captain: LuRocket, legend: LuTrophy }[v] || LuPartyPopper),
  score_milestone: () => LuStar,
  commit_count: (v) => v === '1' ? LuTarget : LuFlame,
  first_vouch: () => LuHandshake,
};

const ICON_COLORS: Record<string, string> = {
  tier_upgrade: 'text-brand bg-brand-50',
  score_milestone: 'text-amber-600 bg-amber-50',
  commit_count: 'text-indigo-600 bg-indigo-50',
  first_vouch: 'text-green-600 bg-green-50',
};

export default function MilestoneCard({
  milestones,
  username,
  score,
}: {
  milestones: Milestone[];
  username: string;
  score: number;
}) {
  const [shared, setShared] = useState<string | null>(null);

  if (milestones.length === 0) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gtmcommit.com';

  const handleShare = (m: Milestone) => {
    const label = LABELS[m.milestone_type]?.(m.milestone_value) || 'Achievement Unlocked!';
    const text = `${label} My GTM Commit Score: ${score}. Talk is cheap. Commits aren't. #GTMCommit #AIShipped`;
    const url = `${appUrl}/${username}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setShared(m.id);
    setTimeout(() => setShared(null), 3000);
  };

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuPartyPopper size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Milestones</h2>
      </div>
      <div className="space-y-3">
        {milestones.map((m) => {
          const label = LABELS[m.milestone_type]?.(m.milestone_value) || m.milestone_type;
          const Icon = ICONS[m.milestone_type]?.(m.milestone_value) || LuPartyPopper;
          const colorClass = ICON_COLORS[m.milestone_type] || 'text-brand bg-brand-50';
          const isNew = !m.seen_at;

          return (
            <div
              key={m.id}
              className={`flex items-center justify-between bg-white rounded-xl px-4 py-3 border ${
                isNew ? 'border-brand/30 shadow-sm' : 'border-surface-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {label}
                    {isNew && (
                      <span className="text-[10px] font-bold text-brand bg-brand-50 px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>
                  <div className="text-xs text-fg-muted">
                    {new Date(m.achieved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleShare(m)}
                className="text-xs text-brand hover:text-brand-dark flex items-center gap-1 transition-colors"
              >
                {shared === m.id ? <><LuCheck size={12} /> Shared</> : <><LuShare2 size={12} /> Share</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
