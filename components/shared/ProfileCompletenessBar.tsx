export default function ProfileCompletenessBar({ completeness }: { completeness: number }) {
  const pct = Math.min(100, Math.max(0, completeness));

  return (
    <div className="bg-surface-secondary rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">Profile Completeness</span>
        <span className="text-sm font-bold text-brand">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-surface-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full gradient-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-xs text-fg-muted mt-2">
          Complete your profile to earn up to <span className="font-semibold text-brand">+20 pts</span>. Fill in the fields marked with dots below.
        </p>
      )}
    </div>
  );
}
