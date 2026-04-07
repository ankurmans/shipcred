import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuTrendingUp, LuUsers, LuGitCommitHorizontal, LuWrench, LuArrowRight } from 'react-icons/lu';

export const metadata: Metadata = {
  title: 'Community Stats & Trends — GTM Commit',
  description: 'Live stats on the AI-native GTM community. See who\'s shipping, which tools are trending, and how the GTM Engineer role is evolving.',
  openGraph: {
    title: 'Community Stats & Trends — GTM Commit',
    description: 'Live stats on the AI-native GTM community.',
  },
};

const TOOL_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  copilot: 'GitHub Copilot',
  cursor: 'Cursor',
  aider: 'Aider',
  windsurf: 'Windsurf',
  devin: 'Devin',
  lovable: 'Lovable',
  codex: 'OpenAI Codex',
};

const ROLE_LABELS: Record<string, string> = {
  marketer: 'Marketers',
  sdr: 'SDRs',
  ae: 'Account Executives',
  growth: 'Growth / GTM Engineers',
  founder: 'Founders',
  other: 'Other',
};

const TIER_LABELS: Record<string, { label: string; emoji: string }> = {
  legend: { label: 'Legend', emoji: '🏆' },
  captain: { label: 'Captain', emoji: '🚀' },
  builder: { label: 'Builder', emoji: '🔨' },
  shipper: { label: 'Shipper', emoji: '📦' },
  unranked: { label: 'Unranked', emoji: '—' },
};

export default async function StatsPage() {
  const supabase = createAdminClient();

  // Parallel queries for all stats
  const [
    totalBuildersRes,
    totalCommitsRes,
    aiCommitsRes,
    toolBreakdownRes,
    roleBreakdownRes,
    tierBreakdownRes,
    topBuildersRes,
    recentSignupsRes,
    avgScoreRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('gtmcommit_score', 0),
    supabase.from('github_commits').select('*', { count: 'exact', head: true }),
    supabase.from('github_commits').select('*', { count: 'exact', head: true }).not('ai_tool_detected', 'is', null),
    supabase.from('github_commits').select('ai_tool_detected').not('ai_tool_detected', 'is', null),
    supabase.from('profiles').select('role').gt('gtmcommit_score', 0),
    supabase.from('profiles').select('gtmcommit_tier').gt('gtmcommit_score', 0),
    supabase.from('profiles')
      .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role')
      .gt('gtmcommit_score', 0)
      .order('gtmcommit_score', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('gtmcommit_score', 0)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('profiles').select('gtmcommit_score').gt('gtmcommit_score', 0),
  ]);

  const totalBuilders = totalBuildersRes.count || 0;
  const totalCommits = totalCommitsRes.count || 0;
  const aiCommits = aiCommitsRes.count || 0;
  const newThisWeek = recentSignupsRes.count || 0;

  // Tool breakdown
  const toolCounts: Record<string, number> = {};
  for (const row of (toolBreakdownRes.data || [])) {
    if (row.ai_tool_detected) {
      toolCounts[row.ai_tool_detected] = (toolCounts[row.ai_tool_detected] || 0) + 1;
    }
  }
  const toolsSorted = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);

  // Role breakdown
  const roleCounts: Record<string, number> = {};
  for (const row of (roleBreakdownRes.data || [])) {
    const r = row.role || 'other';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  }
  const rolesSorted = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);

  // Tier breakdown
  const tierCounts: Record<string, number> = {};
  for (const row of (tierBreakdownRes.data || [])) {
    tierCounts[row.gtmcommit_tier] = (tierCounts[row.gtmcommit_tier] || 0) + 1;
  }

  // Average score
  const scores = (avgScoreRes.data || []).map((p) => p.gtmcommit_score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const topBuilders = topBuildersRes.data || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <h1 className="font-display text-3xl font-bold">Community Stats</h1>
          <p className="text-fg-secondary mt-2 mb-8">
            Live data from the GTM Commit community. Updated in real-time.
          </p>

          {/* Hero stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={<LuUsers size={20} />} value={totalBuilders.toLocaleString()} label="Verified Builders" />
            <StatCard icon={<LuGitCommitHorizontal size={20} />} value={aiCommits.toLocaleString()} label="AI Commits Detected" />
            <StatCard icon={<LuWrench size={20} />} value={String(toolsSorted.length)} label="AI Tools Tracked" />
            <StatCard icon={<LuTrendingUp size={20} />} value={avgScore.toLocaleString()} label="Avg Score" />
          </div>

          {/* GTM Engineer spotlight */}
          <div className="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand/20 rounded-2xl p-6 mb-10">
            <div className="flex items-center gap-2 mb-3">
              <LuTrendingUp size={18} className="text-brand" />
              <h2 className="font-display text-xl font-bold">GTM Engineer Spotlight</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MiniStat value="205%" label="Role growth (2024–2025)" />
              <MiniStat value={String(roleCounts['growth'] || 0)} label="GTM Engineers on platform" />
              <MiniStat value={`${newThisWeek}`} label="New builders this week" />
              <MiniStat value={totalCommits.toLocaleString()} label="Total commits analyzed" />
            </div>
            <p className="text-sm text-fg-secondary">
              The GTM Engineer is the fastest-growing role in tech. Companies like Ramp, Intercom, and Apollo are hiring marketers who commit code.{' '}
              <Link href="/roles/gtm-engineer" className="text-brand font-semibold hover:underline">
                See all GTM Engineers →
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Tool breakdown */}
            <div>
              <h2 className="font-display text-lg font-bold mb-4">Top AI Tools</h2>
              <div className="space-y-3">
                {toolsSorted.map(([tool, count]) => {
                  const pct = aiCommits > 0 ? Math.round((count / aiCommits) * 100) : 0;
                  return (
                    <Link key={tool} href={`/tools/${tool}`} className="block group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium group-hover:text-brand transition-colors">
                          {TOOL_LABELS[tool] || tool}
                        </span>
                        <span className="text-xs text-fg-muted">{count.toLocaleString()} commits · {pct}%</span>
                      </div>
                      <div className="w-full bg-surface-secondary rounded-full h-2">
                        <div
                          className="gradient-brand h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
                {toolsSorted.length === 0 && (
                  <p className="text-sm text-fg-muted">No tool data yet.</p>
                )}
              </div>
            </div>

            {/* Role breakdown */}
            <div>
              <h2 className="font-display text-lg font-bold mb-4">Builders by Role</h2>
              <div className="space-y-3">
                {rolesSorted.map(([role, count]) => {
                  const pct = totalBuilders > 0 ? Math.round((count / totalBuilders) * 100) : 0;
                  return (
                    <Link key={role} href={`/roles/${role}`} className="block group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium group-hover:text-brand transition-colors">
                          {ROLE_LABELS[role] || role}
                        </span>
                        <span className="text-xs text-fg-muted">{count} · {pct}%</span>
                      </div>
                      <div className="w-full bg-surface-secondary rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
                {rolesSorted.length === 0 && (
                  <p className="text-sm text-fg-muted">No role data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Tier distribution */}
          <div className="mb-10">
            <h2 className="font-display text-lg font-bold mb-4">Tier Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['legend', 'captain', 'builder', 'shipper'].map((tier) => {
                const info = TIER_LABELS[tier];
                const count = tierCounts[tier] || 0;
                return (
                  <div key={tier} className="bg-surface-secondary rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{info.emoji}</div>
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-xs text-fg-muted">{info.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top builders */}
          {topBuilders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold">Top Builders</h2>
                <Link href="/leaderboard" className="text-sm text-brand hover:underline flex items-center gap-1">
                  Full Leaderboard <LuArrowRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {topBuilders.map((u, i) => (
                  <Link
                    key={u.username}
                    href={`/${u.username}`}
                    className="flex items-center justify-between bg-white border border-surface-border rounded-xl p-4 hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-fg-muted w-6">{i + 1}</span>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.display_name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                          {u.display_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm">{u.display_name}</div>
                        <div className="text-xs text-fg-muted">@{u.username}{u.role ? ` · ${u.role}` : ''}</div>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-brand">{u.gtmcommit_score}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center py-12 border-t border-surface-border">
            <h2 className="font-display text-2xl font-bold mb-2">Join the community</h2>
            <p className="text-fg-secondary mb-6">Free to start. Takes 2 minutes.</p>
            <Link href="/login" className="btn-brand btn-lg">
              Get Your Score →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white border border-surface-border rounded-xl p-4 text-center">
      <div className="flex justify-center text-brand mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-fg-muted mt-1">{label}</div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/70 rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-fg-primary">{value}</div>
      <div className="text-[11px] text-fg-muted">{label}</div>
    </div>
  );
}
