'use client';

import { LuRocket, LuGitBranch, LuVideo, LuFileText, LuUsers, LuArrowRight, LuWrench } from 'react-icons/lu';
import type { NextAction } from '@/lib/gamification/next-actions';

const CATEGORY_ICON: Record<string, typeof LuRocket> = {
  setup: LuGitBranch,
  proof: LuWrench,
  social: LuUsers,
  content: LuFileText,
};

const CATEGORY_COLOR: Record<string, string> = {
  setup: 'text-brand bg-brand-50',
  proof: 'text-indigo-600 bg-indigo-50',
  social: 'text-green-600 bg-green-50',
  content: 'text-blue-600 bg-blue-50',
};

export default function NextActionsCard({ actions }: { actions: NextAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuRocket size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Your Next Moves</h2>
      </div>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = CATEGORY_ICON[action.category] || LuRocket;
          const colorClass = CATEGORY_COLOR[action.category] || CATEGORY_COLOR.setup;

          return (
            <a
              key={action.id}
              href={action.href}
              className="flex items-center gap-3 bg-white border border-surface-border rounded-xl p-4 hover:shadow-card-hover hover:border-brand/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-fg-primary">{action.label}</div>
                <div className="text-xs text-fg-muted mt-0.5 truncate">{action.description}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-brand bg-brand-50 px-2 py-1 rounded-full">
                  +{action.pointsPotential} pts
                </span>
                <LuArrowRight size={14} className="text-fg-faint group-hover:text-brand transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
