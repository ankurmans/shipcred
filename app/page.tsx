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

export default function Home() {
  return (
    <main>
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
