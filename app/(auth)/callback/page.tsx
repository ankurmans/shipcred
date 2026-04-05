'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type === 'magiclink') {
      const supabase = createClient();
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
      router.push('/login?error=invalid_state');
    }
  }, [router, searchParams]);

  return null;
}

export default function CallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60">Signing you in...</p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
