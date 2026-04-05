import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Connect GitHub' };

export default async function ConnectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username, github_connected_at, github_scopes, last_github_sync_at')
    .eq('user_id', user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">GitHub Connection</h1>
      <p className="text-base-content/60 mt-1">Manage your GitHub integration.</p>

      <div className="card bg-base-200 mt-8">
        <div className="card-body">
          {profile?.github_username ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="badge badge-success">Connected</span>
                <span className="font-semibold">@{profile.github_username}</span>
              </div>

              <div className="text-sm text-base-content/60 space-y-1">
                <p>Connected: {profile.github_connected_at ? new Date(profile.github_connected_at).toLocaleDateString() : 'Unknown'}</p>
                <p>Scopes: {profile.github_scopes?.join(', ') || 'None'}</p>
                <p>Last sync: {profile.last_github_sync_at ? new Date(profile.last_github_sync_at).toLocaleDateString() : 'Never'}</p>
              </div>

              <div className="alert alert-info text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>We never store source code. Only commit metadata (SHA, timestamp, diff stats, AI tool detection).</span>
              </div>

              <a href="/api/auth/github" className="btn btn-ghost btn-sm">
                Reconnect GitHub
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Connect your GitHub to detect AI-assisted commits and build your ShipCred Score.</p>
              <a href="/api/auth/github" className="btn btn-primary">
                Connect GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
