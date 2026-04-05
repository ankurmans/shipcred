import type { LeaderboardEntry } from '@/types';
import { getTierInfo } from '@/lib/scoring/tiers';
import Avatar from '@/components/shared/Avatar';
import Link from 'next/link';

interface RankCardProps {
  entry: LeaderboardEntry;
  rank: number;
}

export default function RankCard({ entry, rank }: RankCardProps) {
  const tierInfo = getTierInfo(entry.shipcred_tier);

  return (
    <Link
      href={`/${entry.username}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
    >
      <div className="text-lg font-bold text-base-content/40 w-8 text-right">
        {rank <= 3 ? ['', '🥇', '🥈', '🥉'][rank] : `#${rank}`}
      </div>
      <Avatar src={entry.avatar_url} alt={entry.display_name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{entry.display_name}</div>
        <div className="text-xs text-base-content/50 truncate">
          @{entry.username}
          {entry.role && ` · ${entry.role}`}
          {entry.company && ` @ ${entry.company}`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`badge ${tierInfo.color} badge-sm`}>
          {tierInfo.emoji} {tierInfo.label}
        </span>
        <div className="text-xl font-bold text-primary min-w-[3rem] text-right">
          {entry.shipcred_score}
        </div>
      </div>
    </Link>
  );
}
