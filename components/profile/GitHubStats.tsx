interface GitHubStatsProps {
  totalCommits: number;
  aiCommits: number;
  toolsDetected: Record<string, number>;
  activeWeeks: number;
}

export default function GitHubStats({ totalCommits, aiCommits, toolsDetected, activeWeeks }: GitHubStatsProps) {
  const aiPct = totalCommits > 0 ? Math.round((aiCommits / totalCommits) * 100) : 0;

  return (
    <div className="bg-surface-secondary rounded-card p-5">
      <h3 className="font-display text-sm font-bold">GitHub Activity</h3>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div>
          <div className="text-2xl font-display font-bold text-brand">{aiCommits}</div>
          <div className="text-xs text-fg-muted">AI Commits ({aiPct}%)</div>
        </div>
        <div>
          <div className="text-2xl font-display font-bold">{totalCommits}</div>
          <div className="text-xs text-fg-muted">Total (6 months)</div>
        </div>
        <div>
          <div className="text-2xl font-display font-bold">{activeWeeks}</div>
          <div className="text-xs text-fg-muted">Active Weeks</div>
        </div>
      </div>
      {Object.keys(toolsDetected).length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-fg-muted mb-1">Tools Detected</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(toolsDetected).sort(([, a], [, b]) => b - a).map(([tool, count]) => (
              <span key={tool} className="badge bg-brand-50 text-brand">{tool.replace('_', ' ')} ({count})</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
