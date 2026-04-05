import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import FeaturedProfiles from '@/components/landing/FeaturedProfiles';
import HowItWorks from '@/components/landing/HowItWorks';
import ScoreBreakdown from '@/components/landing/ScoreBreakdown';
import Audience from '@/components/landing/Audience';
import FAQ from '@/components/landing/FAQ';
import LeaderboardPreview from '@/components/landing/LeaderboardPreview';
import Privacy from '@/components/landing/Privacy';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <FeaturedProfiles />
      <HowItWorks />
      <ScoreBreakdown />
      <Audience />
      <FAQ />
      <LeaderboardPreview />
      <Privacy />
      <CTA />
      <Footer />
    </main>
  );
}
