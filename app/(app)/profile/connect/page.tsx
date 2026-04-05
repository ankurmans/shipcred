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
      <h1 className="font-display text-3xl font-bold">GitHub Connection</h1>
      <p className="text-fg-secondary mt-1">Manage your GitHub integration.</p>
      <div className="bg-surface-secondary rounded-card p-6 mt-8">
        {profile?.github_username ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="badge bg-green-100 text-green-700">Connected</span>
              <span className="font-semibold">@{profile.github_username}</span>
            </div>
            <div className="text-sm text-fg-secondary space-y-1">
              <p>Connected: {profile.github_connected_at ? new Date(profile.github_connected_at).toLocaleDateString() : 'Unknown'}</p>
              <p>Scopes: {profile.github_scopes?.join(', ') || 'None'}</p>
              <p>Last sync: {profile.last_github_sync_at ? new Date(profile.last_github_sync_at).toLocaleDateString() : 'Never'}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
              We never store source code. Only commit metadata (SHA, timestamp, diff stats, AI tool detection).
            </div>
            <a href="/api/auth/github" className="btn-ghost btn-sm inline-flex">Reconnect GitHub</a>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Connect your GitHub to detect AI-assisted commits and build your GTM Commit Score.</p>
            <a href="/api/auth/github" className="btn-brand">Connect GitHub</a>
          </div>
        )}
      </div>
    </div>
  );
}
