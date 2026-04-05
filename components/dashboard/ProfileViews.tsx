import { LuEye, LuTrendingUp } from 'react-icons/lu';

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const width = 120;
  const height = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="text-brand">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ProfileViews({
  viewsThisWeek,
  viewsTotal,
  dailyViews,
}: {
  viewsThisWeek: number;
  viewsTotal: number;
  dailyViews?: number[];
}) {
  const isTrending = dailyViews && dailyViews.length >= 2 &&
    dailyViews[dailyViews.length - 1] > dailyViews[dailyViews.length - 2];

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LuEye size={18} className="text-brand" />
          <h2 className="font-display text-lg font-bold">Profile Views</h2>
        </div>
        {isTrending && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <LuTrendingUp size={10} /> Trending
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand">{viewsThisWeek}</div>
            <div className="text-xs text-fg-muted mt-1">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{viewsTotal}</div>
            <div className="text-xs text-fg-muted mt-1">All Time</div>
          </div>
        </div>
        {dailyViews && dailyViews.length > 1 && (
          <div className="shrink-0 ml-4">
            <Sparkline data={dailyViews} />
            <div className="text-[10px] text-fg-faint text-right mt-0.5">7 days</div>
          </div>
        )}
      </div>
    </div>
  );
}
