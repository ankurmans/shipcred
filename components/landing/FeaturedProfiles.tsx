import Link from 'next/link';
import ProofCard from '@/components/profile/ProofCard';

export default function FeaturedProfiles() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Already shipping. Already scored.
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
            <div className="snap-center shrink-0 sm:shrink">
              <ProofCard
                name="Alex Kim"
                role="Growth @ Ramp"
                score={387}
                tier="Builder"
                proofs={[
                  { platform: 'github', title: '19 Cursor commits', subtitle: 'Internal tools · 4 repos', badgeLabel: 'GitHub', badgeBg: '#ECFDF5', badgeColor: '#059669' },
                  { platform: 'vercel', title: '2 live deployments', subtitle: 'Lead gen pages on Vercel', badgeLabel: 'Vercel', badgeBg: '#F5F5F5', badgeColor: '#1A1A1A' },
                  { platform: 'lovable', title: 'CRM dashboard', subtitle: 'Built with Lovable · 8 iterations', badgeLabel: 'Lovable', badgeBg: '#FDF2F8', badgeColor: '#EC4899' },
                ]}
                vouchCount={4}
                url="gtmcommit.com/alex"
              />
            </div>
          </div>
        </div>

        {/* Inline CTA + leaderboard link */}
        <div className="text-center mt-8 sm:mt-10 space-y-3">
          <a href="/login" className="btn-brand btn-sm inline-flex">
            Get your score →
          </a>
          <div>
            <Link href="/leaderboard" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
