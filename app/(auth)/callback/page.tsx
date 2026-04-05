'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const provider = searchParams.get('provider');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    const supabase = createClient();

    if (provider === 'google') {
      // Google OAuth — Supabase handles the session via URL hash automatically
      // Check if we have a session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          // Check if profile exists for this user
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username_confirmed')
            .eq('user_id', session.user.id)
            .single();

          if (!profile) {
            // New Google user — needs profile creation + username selection
            router.push('/onboarding');
          } else if (!profile.username_confirmed) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        } else {
          // No session yet — might still be processing
          // Wait a moment and retry
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, username_confirmed')
                .eq('user_id', retrySession.user.id)
                .single();
              if (!profile) {
                router.push('/onboarding');
              } else {
                router.push('/dashboard');
              }
            } else {
              router.push('/login?error=auth_failed');
            }
          }, 1000);
        }
      });
    } else if (tokenHash && type === 'magiclink') {
      // GitHub OAuth — magic link flow
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
        .then(({ error }) => {
          if (error) {
            console.error('OTP verification error:', error);
            router.push('/login?error=auth_failed');
          } else {
            router.push('/dashboard');
          }
        });
    } else {
      // Check if Supabase already set session from hash params
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
          if (!profile) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/login?error=invalid_state');
        }
      });
    }
  }, [router, searchParams]);

  return null;
}

export default function CallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-fg-secondary">Signing you in...</p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
