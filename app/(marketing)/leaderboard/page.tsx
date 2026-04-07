import { createAdminClient } from '@/lib/supabase/admin';
import type { LeaderboardEntry } from '@/types';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = { title: 'Leaderboard', description: 'Top AI-native GTM professionals ranked by GTM Commit Score.' };
export const dynamic = 'force-dynamic';

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createAdminClient();
  // Try with is_agent_builder, fall back without if column doesn't exist yet
  let { data, error } = await supabase.from('profiles').select('username, display_name, avatar_url, role, company, gtmcommit_score, gtmcommit_tier, is_agent_builder').gt('gtmcommit_score', 0).order('gtmcommit_score', { ascending: false }).limit(100);
  if (error) {
    const res = await supabase.from('profiles').select('username, display_name, avatar_url, role, company, gtmcommit_score, gtmcommit_tier').gt('gtmcommit_score', 0).order('gtmcommit_score', { ascending: false }).limit(100);
    data = res.data as typeof data;
  }
  return (data || []).map(p => ({ ...p, top_tools: [], is_agent_builder: (p as any).is_agent_builder || false }));
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
          <p className="text-fg-secondary mt-2">Top AI-native GTM professionals ranked by GTM Commit Score.</p>
          <div className="mt-8"><LeaderboardTable entries={entries} /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
