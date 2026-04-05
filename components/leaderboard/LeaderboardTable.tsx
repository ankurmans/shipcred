import type { LeaderboardEntry } from '@/types';
import RankCard from './RankCard';

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-fg-muted">
        <p className="text-lg">No builders ranked yet.</p>
        <p className="text-sm mt-1">Be the first to get your GTM Commit.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-border">
      {entries.map((entry, i) => (
        <RankCard key={entry.username} entry={entry} rank={i + 1} />
      ))}
    </div>
  );
}
