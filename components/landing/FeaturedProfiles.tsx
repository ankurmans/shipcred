import Link from 'next/link';
import ProofCard from '@/components/profile/ProofCard';

export default function FeaturedProfiles() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Builders who prove they ship
        </h2>

        {/* Horizontal scroll on mobile, row on desktop */}
        <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible sm:flex-wrap sm:justify-center px-4 sm:px-0 pb-4 sm:pb-0 snap-x snap-mandatory">
            <div className="snap-center shrink-0 sm:shrink">
              <ProofCard
                name="Marc Rivera"
                role="SDR @ Apollo"
                score={812}
                tier="Legend"
                proofs={[
                  { platform: 'github', title: '92 AI-assisted commits', subtitle: 'Copilot · Cursor · 12 repos', badgeLabel: 'GitHub', badgeBg: '#ECFDF5', badgeColor: '#059669' },
                  { platform: 'replit', title: 'Outbound sequence builder', subtitle: 'Built with Replit · 200+ runs', badgeLabel: 'Replit', badgeBg: '#FFF7ED', badgeColor: '#F26207' },
                  { platform: 'bolt', title: 'Lead enrichment workflow', subtitle: 'Clay + Bolt integration', badgeLabel: 'Bolt', badgeBg: '#FFFBEB', badgeColor: '#F59E0B' },
                ]}
                vouchCount={7}
                url="gtmcommit.com/marc"
              />
            </div>
            <div className="snap-center shrink-0 sm:shrink">
              <ProofCard
                name="Priya Patel"
                role="Founder @ LaunchAI"
                score={531}
                tier="Captain"
                proofs={[
                  { platform: 'github', title: '28 Claude Code commits', subtitle: 'Landing pages · Automations', badgeLabel: 'GitHub', badgeBg: '#ECFDF5', badgeColor: '#059669' },
                  { platform: 'v0', title: '5 component generations', subtitle: 'UI components via v0.dev', badgeLabel: 'v0', badgeBg: '#F5F5F5', badgeColor: '#666666' },
                ]}
                vouchCount={2}
                url="gtmcommit.com/priya"
              />
            </div>
            {/* CTA card */}
            <div className="snap-center shrink-0 sm:shrink w-[300px] sm:w-full sm:max-w-[340px] p-6 rounded-card bg-surface-inverse border border-surface-border-dark flex flex-col items-center justify-center gap-4 min-h-[280px]">
              <span className="text-4xl font-display font-bold text-brand">?</span>
              <span className="text-lg font-semibold text-white">This could be you</span>
              <span className="text-sm text-white/50 text-center">Claim your profile in 2 minutes</span>
              <a href="/api/auth/github" className="btn-brand btn-sm">
                Get started →
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 sm:mt-8">
          <Link href="/leaderboard" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            View Full Leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
