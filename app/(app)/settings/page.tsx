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
      <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">Settings</h1>
      <p className="text-base-content/60 mt-1">Manage your account.</p>

      <div className="space-y-6 mt-8">
        {/* Account Info */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Account</h2>
            <div className="text-sm space-y-2">
              <p><span className="text-base-content/50">Username:</span> {profile?.username}</p>
              <p><span className="text-base-content/50">GitHub:</span> {profile?.github_username || 'Not connected'}</p>
              <p><span className="text-base-content/50">Member since:</span> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
              <p><span className="text-base-content/50">Profile URL:</span> shipcred.io/{profile?.username}</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Session</h2>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="btn btn-ghost btn-sm">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card bg-base-200 border border-error/20">
          <div className="card-body">
            <h2 className="card-title text-error">Danger Zone</h2>
            <p className="text-sm text-base-content/60">
              Deleting your account removes all your data including commit history,
              portfolio, and vouches. This action cannot be undone.
            </p>
            <div className="card-actions">
              <button className="btn btn-error btn-sm btn-outline" disabled>
                Delete Account (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
