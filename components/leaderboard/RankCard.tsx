import type { LeaderboardEntry } from '@/types';
import Link from 'next/link';
import { LuMedal } from 'react-icons/lu';
import { TierBadge } from '@/components/shared/TierIcon';

const RANK_COLORS = ['', '#FFD700', '#C0C0C0', '#CD7F32'];

export default function RankCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <Link href={`/${entry.username}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-secondary transition-colors">
      <div className="text-lg font-bold text-fg-faint w-8 text-right">
        {rank <= 3 ? <LuMedal size={20} style={{ color: RANK_COLORS[rank] }} /> : `#${rank}`}
      </div>
      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
        {entry.display_name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{entry.display_name}</div>
        <div className="text-xs text-fg-muted truncate">@{entry.username}{entry.role && ` · ${entry.role}`}</div>
      </div>
      <span className="badge bg-brand-50 text-brand"><TierBadge tier={entry.gtmcommit_tier} /></span>
      <div className="text-xl font-display font-bold text-brand min-w-[3rem] text-right">{entry.gtmcommit_score}</div>
    </Link>
  );
}
