import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import ScoreBreakdown from '@/components/landing/ScoreBreakdown';
import FeaturedProfiles from '@/components/landing/FeaturedProfiles';
import Privacy from '@/components/landing/Privacy';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <ScoreBreakdown />
      <FeaturedProfiles />
      <Privacy />
      <CTA />
      <Footer />
    </main>
  );
}
