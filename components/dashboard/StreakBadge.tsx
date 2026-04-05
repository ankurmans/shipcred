import { LuFlame } from 'react-icons/lu';

export default function StreakBadge({ current, longest }: { current: number; longest: number }) {
  if (current === 0 && longest === 0) return null;

  const isOnFire = current >= 4;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
        isOnFire
          ? 'gradient-brand text-white'
          : 'bg-surface-muted text-fg-secondary'
      }`}>
        <LuFlame size={14} className={isOnFire ? 'text-white' : 'text-brand'} />
        {current}w
      </div>
      {longest > current && (
        <span className="text-xs text-fg-faint">Best: {longest}w</span>
      )}
    </div>
  );
}
