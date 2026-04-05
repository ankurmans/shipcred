'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  // Pre-fill display name from Google profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
      setDisplayName(name);
      // Suggest username from name
      const suggested = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      if (suggested) setUsername(suggested);
    });
  }, [router, supabase.auth]);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
      setAvailable(!data);
      setChecking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [username, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || username.length < 3) return;

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: user.id,
      username: username.toLowerCase(),
      display_name: displayName || username,
      avatar_url: user.user_metadata?.avatar_url || null,
      auth_provider: 'google',
      username_confirmed: true,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Username already taken. Try another.');
        setAvailable(false);
      } else {
        setError(insertError.message);
      }
      setSaving(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <div className="w-full max-w-md bg-white rounded-card shadow-card p-8">
        <h1 className="font-display text-2xl font-bold text-center">
          Claim your GTM Commit page
        </h1>
        <p className="text-fg-secondary text-center mt-2 text-sm">
          Choose your URL. This is your permanent profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Username picker */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Your URL</label>
            <div className="flex items-center border border-surface-border rounded-lg px-4 py-3 bg-surface-secondary focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand">
              <span className="text-fg-muted font-mono text-sm">gtmcommit.com/</span>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                placeholder="yourname"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="bg-transparent font-mono text-sm font-bold text-fg-primary outline-none flex-1 min-w-0 placeholder:text-fg-faint"
              />
              <div className="ml-2 shrink-0">
                {checking && <div className="w-4 h-4 border-2 border-fg-muted border-t-transparent rounded-full animate-spin" />}
                {!checking && available === true && <span className="text-green-600 text-sm font-semibold">Available</span>}
                {!checking && available === false && <span className="text-red-500 text-sm font-semibold">Taken</span>}
              </div>
            </div>
            <p className="text-xs text-fg-muted mt-1">Lowercase letters, numbers, hyphens, underscores. Min 3 characters.</p>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Name</label>
            <input
              type="text"
              required
              placeholder="Your Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving || !available || username.length < 3}
            className="btn-brand w-full"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              `Claim gtmcommit.com/${username || '...'}`
            )}
          </button>
        </form>

        <p className="text-xs text-fg-muted text-center mt-6">
          You can connect GitHub later to scan your AI-assisted commits.
        </p>
      </div>
    </main>
  );
}
