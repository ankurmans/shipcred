import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuShield, LuCheck, LuX } from 'react-icons/lu';

interface PageProps { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Claim ${username} — GTM Commit`,
    description: `Is gtmcommit.com/${username} available? Claim your username and build your verified proof-of-work profile.`,
    robots: { index: false },
  };
}

export default async function ClaimPage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier')
    .eq('username', cleanUsername)
    .single();

  const isTaken = !!existing;

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            isTaken ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand'
          }`}>
            <LuShield size={32} />
          </div>

          <h1 className="font-display text-2xl font-bold mb-2">
            gtmcommit.com/<span className="text-brand">{cleanUsername}</span>
          </h1>

          {isTaken ? (
            <>
              <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
                <LuX size={18} />
                <span className="font-semibold">This username is taken</span>
              </div>

              <div className="bg-surface-secondary rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  {existing.avatar_url ? (
                    <img src={existing.avatar_url} alt={existing.display_name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                      {existing.display_name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-sm">{existing.display_name}</div>
                    <div className="text-xs text-fg-muted">Score: {existing.gtmcommit_score} · {existing.gtmcommit_tier}</div>
                  </div>
                </div>
                <Link href={`/${existing.username}`} className="btn-ghost btn-sm w-full mt-3">
                  View Profile →
                </Link>
              </div>

              <p className="text-sm text-fg-muted mb-6">
                You can still sign up and choose a different username.
              </p>
              <Link href="/login" className="btn-brand btn-lg w-full">
                Sign Up with GitHub →
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-brand mb-4">
                <LuCheck size={18} />
                <span className="font-semibold">This username is available!</span>
              </div>

              <p className="text-fg-secondary mb-6">
                Claim <span className="font-semibold">gtmcommit.com/{cleanUsername}</span> as your verified proof-of-work profile. Connect GitHub, show what you&apos;ve shipped, and get your score.
              </p>

              <Link href={`/login?claim=${cleanUsername}`} className="btn-brand btn-lg w-full mb-4">
                Claim This Username →
              </Link>

              <p className="text-xs text-fg-muted">
                Free to start. Takes 2 minutes. Your code stays private.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
