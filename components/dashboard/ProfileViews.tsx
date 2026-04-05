import { LuEye } from 'react-icons/lu';

export default function ProfileViews({ viewsThisWeek, viewsTotal }: { viewsThisWeek: number; viewsTotal: number }) {
  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuEye size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Profile Views</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand">{viewsThisWeek}</div>
          <div className="text-xs text-fg-muted mt-1">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{viewsTotal}</div>
          <div className="text-xs text-fg-muted mt-1">All Time</div>
        </div>
      </div>
    </div>
  );
}
