'use client';

import {
  LuTarget, LuClock, LuCheck, LuUser, LuGitBranch,
  LuClipboardCheck, LuHandshake, LuWrench, LuPenTool,
  LuUsers, LuVideo,
} from 'react-icons/lu';
import { getChallengeDefinition } from '@/lib/gamification/challenges';
import type { IconType } from 'react-icons';

interface Challenge {
  id: string;
  challenge_id: string;
  status: string;
  progress: number;
  target: number;
  expires_at: string | null;
  completed_at: string | null;
}

const ICON_MAP: Record<string, IconType> = {
  user: LuUser,
  gitBranch: LuGitBranch,
  clipboardCheck: LuClipboardCheck,
  handshake: LuHandshake,
  wrench: LuWrench,
  penTool: LuPenTool,
  users: LuUsers,
  video: LuVideo,
};

export default function ChallengesCard({ challenges }: { challenges: Challenge[] }) {
  if (challenges.length === 0) return null;

  const active = challenges.filter(c => c.status === 'active');
  const completed = challenges.filter(c => c.status === 'completed');

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuTarget size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Challenges</h2>
        {completed.length > 0 && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {completed.length} done
          </span>
        )}
      </div>

      <div className="space-y-3">
        {active.map((c) => {
          const def = getChallengeDefinition(c.challenge_id);
          if (!def) return null;

          const pct = c.target > 0 ? Math.min(100, (c.progress / c.target) * 100) : 0;
          const timeLeft = c.expires_at ? getTimeLeft(c.expires_at) : null;
          const Icon = ICON_MAP[def.iconName] || LuTarget;

          return (
            <div key={c.id} className="bg-white border border-surface-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{def.title}</div>
                    <div className="text-xs text-fg-muted mt-0.5">{def.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {timeLeft && (
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                      timeLeft.urgent ? 'bg-red-50 text-red-600' : 'bg-surface-muted text-fg-muted'
                    }`}>
                      <LuClock size={10} /> {timeLeft.label}
                    </span>
                  )}
                  <span className="text-xs font-bold text-brand bg-brand-50 px-2 py-0.5 rounded-full">
                    +{def.bonusPoints}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-brand transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-fg-muted">{c.progress}/{c.target}</span>
              </div>
            </div>
          );
        })}

        {/* Completed — collapsed */}
        {completed.length > 0 && (
          <div className="border-t border-surface-border pt-3 mt-2">
            <div className="text-xs font-semibold text-fg-muted mb-2">Completed</div>
            <div className="flex flex-wrap gap-2">
              {completed.map((c) => {
                const def = getChallengeDefinition(c.challenge_id);
                if (!def) return null;
                const Icon = ICON_MAP[def.iconName] || LuTarget;
                return (
                  <span key={c.id} className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <LuCheck size={12} /> <Icon size={12} /> {def.title}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeLeft(expiresAt: string): { label: string; urgent: boolean } | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);

  if (days > 0) return { label: `${days}d left`, urgent: days <= 1 };
  if (hours > 0) return { label: `${hours}h left`, urgent: true };
  return { label: 'Expiring!', urgent: true };
}
