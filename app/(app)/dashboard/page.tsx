import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SyncButton from './sync-button';
import NextActionsCard from '@/components/dashboard/NextActionsCard';
import TierProgressBar from '@/components/dashboard/TierProgressBar';
import ScoreBreakdownDrawer from '@/components/dashboard/ScoreBreakdownDrawer';
import MilestoneCard from '@/components/dashboard/MilestoneCard';
import LeaderboardRankCard from '@/components/dashboard/LeaderboardRankCard';
import ProfileViews from '@/components/dashboard/ProfileViews';
import ReferralSection from '@/components/dashboard/ReferralSection';
import EmbedCodeGenerator from '@/components/dashboard/EmbedCodeGenerator';
import StreakBadge from '@/components/dashboard/StreakBadge';
import ChallengesCard from '@/components/dashboard/ChallengesCard';
import { getNextActions } from '@/lib/gamification/next-actions';
import type { ScoreBreakdown, GtmCommitTier } from '@/types';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');

  const admin = createAdminClient();
  const [
    toolsRes, syncJobRes, videosRes, contentRes, certsRes,
    milestonesRes, viewsWeekRes, viewsTotalRes, referralCountRes,
    rankRes, totalBuildersRes, challengesRes,
  ] = await Promise.all([
    admin.from('tool_declarations').select('*').eq('profile_id', profile.id),
    admin.from('github_sync_jobs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(1),
    admin.from('video_proofs').select('id, url_verified').eq('profile_id', profile.id),
    admin.from('content_proofs').select('id, url_verified').eq('profile_id', profile.id),
    admin.from('certifications').select('id, verification_status').eq('profile_id', profile.id),
    admin.from('profile_milestones').select('*').eq('profile_id', profile.id).order('achieved_at', { ascending: false }).limit(20),
    admin.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).gte('viewed_at', new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0]),
    admin.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', profile.username),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gt('gtmcommit_score', profile.gtmcommit_score),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gt('gtmcommit_score', 0),
    admin.from('profile_challenges').select('*').eq('profile_id', profile.id).order('started_at', { ascending: false }),
  ]);

  const tools = toolsRes.data || [];
  const lastSync = syncJobRes.data?.[0] || null;
  const videoCount = videosRes.data?.length || 0;
  const contentCount = contentRes.data?.length || 0;
  const certCount = certsRes.data?.length || 0;
  const milestones = milestonesRes.data || [];
  const viewsThisWeek = viewsWeekRes.count || 0;
  const viewsTotal = viewsTotalRes.count || 0;
  const referralCount = referralCountRes.count || 0;
  const rank = (rankRes.count || 0) + 1;
  const totalBuilders = totalBuildersRes.count || 0;
  const challenges = challengesRes.data || [];

  // Fetch daily views for sparkline (last 7 days)
  const dailyViews: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400 * 1000).toISOString().split('T')[0];
    const nextDay = new Date(Date.now() - (i - 1) * 86400 * 1000).toISOString().split('T')[0];
    const { count } = await admin
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id)
      .gte('viewed_at', day)
      .lt('viewed_at', nextDay);
    dailyViews.push(count || 0);
  }

  const breakdown = (profile.score_breakdown || { tier1: 0, tier2: 0, tier3: 0, total: 0, detail: {} }) as ScoreBreakdown;

  // Compute next actions
  const nextActions = getNextActions(
    {
      github_username: profile.github_username,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      role: profile.role,
      website_url: profile.website_url,
      linkedin_url: profile.linkedin_url,
      twitter_handle: profile.twitter_handle,
    },
    breakdown,
  );

  // Mark milestones as seen
  const unseenIds = milestones.filter((m: any) => !m.seen_at).map((m: any) => m.id);
  if (unseenIds.length > 0) {
    admin.from('profile_milestones').update({ seen_at: new Date().toISOString() }).in('id', unseenIds).then(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-fg-secondary mt-1">Your GTM Commit at a glance.</p>
      </div>

      {/* 1. Score Card with Tier Progress */}
      <div className="bg-surface-secondary rounded-card p-6">
        <div className="flex items-center gap-6">
          <div className="px-6 py-3 rounded-2xl gradient-brand">
            <span className="font-display text-5xl font-bold text-white">{profile.gtmcommit_score}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold">GTM Commit Score</div>
              <StreakBadge current={profile.current_streak || 0} longest={profile.longest_streak || 0} />
            </div>
            <div className="text-sm text-fg-muted capitalize">{profile.gtmcommit_tier} Tier</div>
          </div>
        </div>
        <TierProgressBar score={profile.gtmcommit_score} tier={profile.gtmcommit_tier as GtmCommitTier} />
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: 'Auto-Verified', value: breakdown.tier1 || 0, max: 600, color: 'bg-green-500' },
            { label: 'Community Verified', value: breakdown.tier2 || 0, max: 250, color: 'bg-blue-500' },
            { label: 'Self-Reported', value: breakdown.tier3 || 0, max: 150, color: 'bg-amber-500' },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs text-fg-muted mb-1">
                <span>{b.label}</span>
                <span>{b.value}/{b.max}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full`} style={{ width: `${Math.min(100, (b.value / b.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Next Actions */}
      <NextActionsCard actions={nextActions} />

      {/* 3. Challenges */}
      <ChallengesCard challenges={challenges} />

      {/* 4. Score Breakdown Drill-Down */}
      {breakdown.detail && <ScoreBreakdownDrawer breakdown={breakdown} />}

      {/* 4. Milestones + Leaderboard Rank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MilestoneCard milestones={milestones} username={profile.username} score={profile.gtmcommit_score} />
        <LeaderboardRankCard rank={rank} totalBuilders={totalBuilders} />
      </div>

      {/* 5. Profile Views + Referral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileViews viewsThisWeek={viewsThisWeek} viewsTotal={viewsTotal} dailyViews={dailyViews} />
        <ReferralSection username={profile.username} referralCount={referralCount} />
      </div>

      {/* 6. GitHub Sync + Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-secondary rounded-card p-6">
          <h2 className="font-display text-lg font-bold">GitHub Sync</h2>
          {profile.github_username ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-fg-secondary">
                Connected as <strong>@{profile.github_username}</strong>
              </p>
              {lastSync && (
                <div className="text-sm flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    lastSync.status === 'completed' ? 'bg-green-100 text-green-700' :
                    lastSync.status === 'failed' ? 'bg-red-100 text-red-700' :
                    lastSync.status === 'running' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {lastSync.status}
                  </span>
                  {lastSync.status === 'completed' && (
                    <span className="text-fg-muted">
                      {lastSync.repos_scanned} repos, {lastSync.ai_commits_found} AI commits
                    </span>
                  )}
                </div>
              )}
              <SyncButton />
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-fg-secondary mb-3">Connect GitHub to detect your AI-assisted commits.</p>
              <a href="/api/auth/github" className="btn-brand btn-sm">Connect GitHub</a>
            </div>
          )}
        </div>

        {tools.length > 0 ? (
          <div className="bg-surface-secondary rounded-card p-6">
            <h2 className="font-display text-lg font-bold mb-3">Detected Tools</h2>
            <div className="flex flex-wrap gap-2">
              {tools.map((t: { id: string; tool_name: string; is_verified: boolean; verified_commit_count: number }) => (
                <span key={t.id} className="badge bg-brand-50 text-brand">
                  {t.is_verified && '✓ '}{t.tool_name.replace('_', ' ')}
                  {t.verified_commit_count > 0 && ` (${t.verified_commit_count})`}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface-secondary rounded-card p-6">
            <h2 className="font-display text-lg font-bold">Showcase</h2>
            <div className="flex items-center justify-between mt-3">
              <a href="/showcase" className="text-sm text-brand hover:text-brand-dark">Manage Showcase</a>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{videoCount}</div>
                <div className="text-xs text-fg-muted">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{contentCount}</div>
                <div className="text-xs text-fg-muted">Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{certCount}</div>
                <div className="text-xs text-fg-muted">Certs</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Embed Code */}
      <EmbedCodeGenerator username={profile.username} score={profile.gtmcommit_score} tier={profile.gtmcommit_tier} />
    </div>
  );
}
