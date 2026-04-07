'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { analytics } from '@/lib/analytics';

function LoginForm() {
  const searchParams = useSearchParams();
  const desiredUsername = searchParams.get('username') || searchParams.get('claim') || '';
  const referrer = searchParams.get('ref') || '';
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin_oidc') => {
    setLoading(provider);
    analytics.loginStarted(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback?provider=${provider}`,
      },
    });
  };

  const githubParams = new URLSearchParams();
  if (desiredUsername) githubParams.set('username', desiredUsername);
  if (referrer) githubParams.set('ref', referrer);
  const githubUrl = `/api/auth/github${githubParams.toString() ? `?${githubParams.toString()}` : ''}`;

  return (
    <div className="w-full max-w-md bg-white rounded-card shadow-card p-8 text-center">
      <h1 className="font-display text-3xl font-bold">
        Get Your GTM Commit
      </h1>
      <p className="text-fg-secondary mt-2">
        Create your proof-of-work profile in 2 minutes.
      </p>

      {/* GitHub */}
      <a
        href={githubUrl}
        onClick={() => { setLoading('github'); analytics.loginStarted('github'); }}
        className="btn-primary w-full mt-6 gap-2"
      >
        {loading === 'github' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        Continue with GitHub
      </a>
      <p className="text-xs text-fg-muted mt-1.5">
        Auto-scans your AI commits from Claude Code, Cursor, Copilot
      </p>

      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-fg-muted">OR</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Google + LinkedIn side by side */}
      <div className="flex gap-3">
        <button
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading !== null}
          className="btn-ghost flex-1 gap-2"
        >
          {loading === 'google' ? (
            <div className="w-4 h-4 border-2 border-fg-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Google
        </button>

        <button
          onClick={() => handleOAuthSignIn('linkedin_oidc')}
          disabled={loading !== null}
          className="btn-ghost flex-1 gap-2"
        >
          {loading === 'linkedin_oidc' ? (
            <div className="w-4 h-4 border-2 border-fg-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#0A66C2" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          )}
          LinkedIn
        </button>
      </div>
      <p className="text-xs text-fg-muted mt-1.5">
        For Lovable, Bolt, v0, Replit builders — verify via project URLs
      </p>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-fg-muted">HOW IT WORKS</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      <div className="text-left space-y-3">
        <div className="flex gap-3 items-start">
          <span className="w-6 h-6 rounded-full bg-brand-50 text-brand text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <p className="text-sm text-fg-secondary">Sign in with any method above</p>
        </div>
        <div className="flex gap-3 items-start">
          <span className="w-6 h-6 rounded-full bg-brand-50 text-brand text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <p className="text-sm text-fg-secondary">Add your shipped projects — URLs, videos, certifications</p>
        </div>
        <div className="flex gap-3 items-start">
          <span className="w-6 h-6 rounded-full bg-brand-50 text-brand text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <p className="text-sm text-fg-secondary">Verify ownership with a meta tag — prove it&apos;s yours</p>
        </div>
      </div>

      <Link href="/" className="text-sm text-brand hover:text-brand-dark mt-6 inline-block">
        ← Back to home
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-card shadow-card p-8 text-center">
          <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
