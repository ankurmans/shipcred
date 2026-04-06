import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

  return (
    <main>
      <AnnouncementBar />
      <Navbar />
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
