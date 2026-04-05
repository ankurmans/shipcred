import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, github_username, created_at')
    .eq('user_id', user.id)
    .single();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="text-fg-secondary mt-1">Manage your account.</p>
      <div className="space-y-6 mt-8">
        <div className="bg-surface-secondary rounded-card p-6">
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="text-sm space-y-2 mt-3">
            <p><span className="text-fg-muted">Username:</span> {profile?.username}</p>
            <p><span className="text-fg-muted">GitHub:</span> {profile?.github_username || 'Not connected'}</p>
            <p><span className="text-fg-muted">Member since:</span> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
            <p><span className="text-fg-muted">Profile URL:</span> gtmcommit.com/{profile?.username}</p>
          </div>
        </div>
        <div className="bg-surface-secondary rounded-card p-6">
          <h2 className="font-display text-lg font-bold">Session</h2>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button type="submit" className="btn-ghost btn-sm">Sign Out</button>
          </form>
        </div>
        <div className="bg-surface-secondary rounded-card p-6 border border-red-200">
          <h2 className="font-display text-lg font-bold text-red-600">Danger Zone</h2>
          <p className="text-sm text-fg-secondary mt-2">Deleting your account removes all data. This cannot be undone.</p>
          <button className="mt-3 px-4 py-2 rounded-full border border-red-300 text-red-500 text-sm font-medium opacity-50 cursor-not-allowed" disabled>
            Delete Account (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
