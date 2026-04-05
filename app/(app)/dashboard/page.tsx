import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SyncButton from './sync-button';
import EmbedCodeGenerator from '@/components/dashboard/EmbedCodeGenerator';
import MilestoneCard from '@/components/dashboard/MilestoneCard';
import ReferralSection from '@/components/dashboard/ReferralSection';
import ProfileViews from '@/components/dashboard/ProfileViews';

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
  const [toolsRes, syncJobRes, videosRes, contentRes, certsRes, milestonesRes, viewsWeekRes, viewsTotalRes, referralCountRes] = await Promise.all([
    admin.from('tool_declarations').select('*').eq('profile_id', profile.id),
    admin.from('github_sync_jobs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(1),
    admin.from('video_proofs').select('id, url_verified').eq('profile_id', profile.id),
    admin.from('content_proofs').select('id, url_verified').eq('profile_id', profile.id),
    admin.from('certifications').select('id, verification_status').eq('profile_id', profile.id),
    admin.from('profile_milestones').select('*').eq('profile_id', profile.id).order('achieved_at', { ascending: false }).limit(20),
    admin.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).gte('viewed_at', new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0]),
    admin.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', profile.username),
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
  const breakdown = profile.score_breakdown as { tier1?: number; tier2?: number; tier3?: number } || {};

  // Mark milestones as seen
  const unseenIds = milestones.filter((m: any) => !m.seen_at).map((m: any) => m.id);
  if (unseenIds.length > 0) {
    admin.from('profile_milestones').update({ seen_at: new Date().toISOString() }).in('id', unseenIds).then(() => {});
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-fg-secondary mt-1">Your GTM Commit at a glance.</p>
      </div>

      {/* Score card */}
      <div className="bg-surface-secondary rounded-card p-6">
        <div className="flex items-center gap-6">
          <div className="px-6 py-3 rounded-2xl gradient-brand">
            <span className="font-display text-5xl font-bold text-white">{profile.gtmcommit_score}</span>
          </div>
          <div>
            <div className="text-lg font-semibold">GTM Commit Score</div>
            <div className="text-sm text-fg-muted capitalize">{profile.gtmcommit_tier} Tier</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
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

      {/* Milestones + Views row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MilestoneCard milestones={milestones} username={profile.username} score={profile.gtmcommit_score} />
        <ProfileViews viewsThisWeek={viewsThisWeek} viewsTotal={viewsTotal} />
      </div>

      {/* GitHub Sync */}
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

      {/* Tools */}
      {tools.length > 0 && (
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
      )}

      {/* Proof Summary */}
      <div className="bg-surface-secondary rounded-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Proof of Work</h2>
          <a href="/proofs" className="text-sm text-brand hover:text-brand-dark">Manage</a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{videoCount}</div>
            <div className="text-xs text-fg-muted">Video Proofs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{contentCount}</div>
            <div className="text-xs text-fg-muted">Published Content</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{certCount}</div>
            <div className="text-xs text-fg-muted">Certifications</div>
          </div>
        </div>
        {videoCount === 0 && contentCount === 0 && certCount === 0 && (
          <p className="text-sm text-fg-muted text-center mt-3">
            Add video walkthroughs, blog posts, or certifications to boost your score.
          </p>
        )}
      </div>

      {/* Embed + Referral row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmbedCodeGenerator username={profile.username} score={profile.gtmcommit_score} tier={profile.gtmcommit_tier} />
        <ReferralSection username={profile.username} referralCount={referralCount} />
      </div>
    </div>
  );
}
