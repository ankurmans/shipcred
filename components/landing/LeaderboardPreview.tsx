import Link from 'next/link';
import { LuPackage, LuHammer, LuRocket, LuTrophy } from 'react-icons/lu';
import type { ReactNode } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  role: string;
  score: number;
  tier: string;
  initial: string;
  color: string;
}

const TIER_ICONS: Record<string, ReactNode> = {
  Legend: <LuTrophy size={12} className="text-amber-500" />,
  Captain: <LuRocket size={12} className="text-brand" />,
  Builder: <LuHammer size={12} className="text-blue-500" />,
  Shipper: <LuPackage size={12} className="text-fg-muted" />,
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Marc Rivera', role: 'SDR @ Apollo', score: 812, tier: 'Legend', initial: 'M', color: '#FF5C00' },
  { rank: 2, name: 'Sarah Chen', role: 'Growth Engineer', score: 724, tier: 'Captain', initial: 'S', color: '#6366F1' },
  { rank: 3, name: 'Jordan Lee', role: 'GTM Engineer @ Intercom', score: 615, tier: 'Captain', initial: 'J', color: '#06B6D4' },
  { rank: 4, name: 'Priya Patel', role: 'Founder @ LaunchAI', score: 531, tier: 'Captain', initial: 'P', color: '#EC4899' },
  { rank: 5, name: 'Alex Kim', role: 'Growth @ Ramp', score: 387, tier: 'Builder', initial: 'A', color: '#F59E0B' },
];

export default function LeaderboardPreview() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          The GTM Commit Leaderboard
        </h2>
        <p className="text-center text-fg-secondary mt-3 text-sm sm:text-base">
          Top builders ranked by verified proof-of-work.
        </p>

        <div className="mt-8 sm:mt-10 rounded-card border border-surface-border bg-white overflow-hidden">
          {MOCK_LEADERBOARD.map((entry, i) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 ${
                i < MOCK_LEADERBOARD.length - 1 ? 'border-b border-surface-border' : ''
              }`}
            >
              <span className="font-mono text-sm text-fg-muted w-6 text-right shrink-0">
                {entry.rank}
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: entry.color }}
              >
                {entry.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{entry.name}</div>
                <div className="text-xs text-fg-muted truncate">{entry.role}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display font-bold text-brand text-lg">{entry.score}</span>
                <span className="flex items-center gap-1 text-xs font-mono text-fg-muted">
                  {TIER_ICONS[entry.tier]} {entry.tier}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/leaderboard" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            View full leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
