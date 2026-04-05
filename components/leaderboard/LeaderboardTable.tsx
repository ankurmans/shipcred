import type { LeaderboardEntry } from '@/types';
import RankCard from './RankCard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-base-content/50">
        <p className="text-lg">No builders ranked yet.</p>
        <p className="text-sm mt-1">Be the first to get your ShipCred.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-base-200">
      {entries.map((entry, index) => (
        <RankCard key={entry.username} entry={entry} rank={index + 1} />
      ))}
    </div>
  );
}
