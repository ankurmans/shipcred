import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AnnouncementBar from '@/components/shared/AnnouncementBar';
import Navbar from '@/components/shared/Navbar';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import Audience from '@/components/landing/Audience';
import ScoreBreakdown from '@/components/landing/ScoreBreakdown';
import RecentBuilders from '@/components/landing/RecentBuilders';
import FAQ from '@/components/landing/FAQ';
import Privacy from '@/components/landing/Privacy';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  const admin = createAdminClient();
  const { count } = await admin.from('profiles').select('*', { count: 'exact', head: true }).gt('gtmcommit_score', 0);
  const showExplore = (count || 0) >= 10;

  return (
    <main>
      <AnnouncementBar />
      <Navbar showExplore={showExplore} />
      <Hero />
      <Problem />
      <HowItWorks />
      <Audience />
      <ScoreBreakdown />
      <RecentBuilders />
      <FAQ />
      <Privacy />
      <CTA />
      <Footer />
    </main>
  );
}
