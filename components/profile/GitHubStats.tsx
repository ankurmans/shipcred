interface GitHubStatsProps {
  totalCommits: number;
  aiCommits: number;
  toolsDetected: Record<string, number>;
  activeWeeks: number;
}

export default function GitHubStats({
  totalCommits,
  aiCommits,
  toolsDetected,
  activeWeeks,
}: GitHubStatsProps) {
  const aiPercentage = totalCommits > 0 ? Math.round((aiCommits / totalCommits) * 100) : 0;

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <h3 className="card-title text-sm">GitHub Activity</h3>
        <div className="stats stats-vertical lg:stats-horizontal shadow-none bg-transparent">
          <div className="stat p-2">
            <div className="stat-title text-xs">AI Commits</div>
            <div className="stat-value text-lg text-primary">{aiCommits}</div>
            <div className="stat-desc">{aiPercentage}% of total</div>
          </div>
          <div className="stat p-2">
            <div className="stat-title text-xs">Total Commits</div>
            <div className="stat-value text-lg">{totalCommits}</div>
            <div className="stat-desc">Last 6 months</div>
          </div>
          <div className="stat p-2">
            <div className="stat-title text-xs">Active Weeks</div>
            <div className="stat-value text-lg">{activeWeeks}</div>
            <div className="stat-desc">Consistency</div>
          </div>
        </div>

        {Object.keys(toolsDetected).length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-base-content/60 mb-1">AI Tools Detected</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(toolsDetected)
                .sort(([, a], [, b]) => b - a)
                .map(([tool, count]) => (
                  <span key={tool} className="badge badge-sm badge-primary badge-outline">
                    {tool.replace('_', ' ')} ({count})
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
