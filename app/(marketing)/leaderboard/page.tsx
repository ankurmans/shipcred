import { createAdminClient } from '@/lib/supabase/admin';
import type { LeaderboardEntry } from '@/types';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Leaderboard',
  description: 'Top AI-native GTM professionals ranked by ShipCred Score.',
};

export const revalidate = 300; // Cache for 5 minutes

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, role, company, shipcred_score, shipcred_tier')
    .gt('shipcred_score', 0)
    .order('shipcred_score', { ascending: false })
    .limit(100);

  if (!data) return [];

  return data.map((p) => ({
    ...p,
    top_tools: [],
  }));
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">
            Leaderboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Top AI-native GTM professionals ranked by ShipCred Score.
          </p>

          <div className="mt-8">
            <LeaderboardTable entries={entries} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
