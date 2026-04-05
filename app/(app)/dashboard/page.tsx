import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ShipCredScore from '@/components/profile/ShipCredScore';
import ToolBadges from '@/components/profile/ToolBadges';
import ProfileCard from '@/components/profile/ProfileCard';
import SyncButton from './sync-button';

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

  const [toolsRes, syncJobRes] = await Promise.all([
    admin.from('tool_declarations').select('*').eq('profile_id', profile.id),
    admin.from('github_sync_jobs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(1),
  ]);

  const tools = toolsRes.data || [];
  const lastSync = syncJobRes.data?.[0] || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">Dashboard</h1>
        <p className="text-base-content/60 mt-1">Your ShipCred at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score */}
        <div className="card bg-base-200">
          <div className="card-body">
            <ShipCredScore
              score={profile.shipcred_score}
              tier={profile.shipcred_tier}
              breakdown={profile.score_breakdown}
              size="lg"
            />
          </div>
        </div>

        {/* Profile preview */}
        <div>
          <ProfileCard profile={profile} tools={tools} showPoweredBy={false} />
        </div>
      </div>

      {/* GitHub Sync */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">GitHub Sync</h2>
          {profile.github_username ? (
            <div className="space-y-3">
              <p className="text-sm text-base-content/60">
                Connected as <strong>@{profile.github_username}</strong>
              </p>
              {lastSync && (
                <div className="text-sm">
                  <span className={`badge badge-sm ${
                    lastSync.status === 'completed' ? 'badge-success' :
                    lastSync.status === 'failed' ? 'badge-error' :
                    lastSync.status === 'running' ? 'badge-warning' : 'badge-ghost'
                  }`}>
                    {lastSync.status}
                  </span>
                  {lastSync.status === 'completed' && (
                    <span className="ml-2 text-base-content/50">
                      {lastSync.repos_scanned} repos scanned, {lastSync.ai_commits_found} AI commits found
                    </span>
                  )}
                </div>
              )}
              <SyncButton />
            </div>
          ) : (
            <div>
              <p className="text-sm text-base-content/60 mb-3">
                Connect GitHub to detect your AI-assisted commits.
              </p>
              <a href="/api/auth/github" className="btn btn-primary btn-sm">
                Connect GitHub
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tools */}
      {tools.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Detected Tools</h2>
            <ToolBadges tools={tools} />
          </div>
        </div>
      )}
    </div>
  );
}
