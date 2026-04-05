import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import CompareCard from '@/components/profile/CompareCard';
import ShareButton from '@/components/shared/ShareButton';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

interface PageProps {
  params: Promise<{ user1: string; user2: string }>;
}

async function getProfile(username: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role')
    .eq('username', username)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { user1, user2 } = await params;
  const [p1, p2] = await Promise.all([getProfile(user1), getProfile(user2)]);
  if (!p1 || !p2) return { title: 'Compare — GTM Commit' };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return {
    title: `${p1.display_name} vs ${p2.display_name} — GTM Commit`,
    description: `${p1.display_name} (${p1.gtmcommit_score}) vs ${p2.display_name} (${p2.gtmcommit_score}) — Who ships more?`,
    openGraph: {
      title: `${p1.display_name} vs ${p2.display_name}`,
      images: [`${appUrl}/api/og/compare?u1=${user1}&u2=${user2}`],
    },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { user1, user2 } = await params;
  const [p1, p2] = await Promise.all([getProfile(user1), getProfile(user2)]);
  if (!p1 || !p2) notFound();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl font-bold text-center mb-2">Score Comparison</h1>
          <p className="text-fg-muted text-center mb-8">Who ships more with AI?</p>
          <CompareCard left={p1} right={p2} />
          <div className="mt-6 flex justify-center">
            <ShareButton
              url={`${appUrl}/compare/${user1}/${user2}`}
              title={`${p1.display_name} (${p1.gtmcommit_score}) vs ${p2.display_name} (${p2.gtmcommit_score}) on GTM Commit`}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
