import Link from 'next/link';
import { LuTrophy, LuArrowRight } from 'react-icons/lu';

export default function LeaderboardRankCard({ rank, totalBuilders }: { rank: number; totalBuilders: number }) {
  const percentile = totalBuilders > 0 ? Math.max(1, Math.round((1 - (rank - 1) / totalBuilders) * 100)) : 0;

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuTrophy size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Leaderboard</h2>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-brand">#{rank}</div>
        <div className="text-sm text-fg-muted mt-1">of {totalBuilders} builders</div>
        {percentile > 0 && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-brand bg-brand-50 px-2.5 py-1 rounded-full">
              Top {Math.min(100, 101 - percentile)}%
            </span>
          </div>
        )}
      </div>
      <Link
        href="/leaderboard"
        className="flex items-center justify-center gap-1 text-sm text-brand hover:text-brand-dark mt-4 transition-colors"
      >
        View Leaderboard <LuArrowRight size={14} />
      </Link>
    </div>
  );
}
