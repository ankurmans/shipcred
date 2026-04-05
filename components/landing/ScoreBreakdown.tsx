import { LuPackage, LuHammer, LuRocket, LuTrophy } from 'react-icons/lu';
import Link from 'next/link';

const bars = [
  { label: 'Auto-Verified', subtitle: 'GitHub commits, platform deploys, certifications', max: 600, pct: 60, color: 'bg-green-500' },
  { label: 'Community Verified', subtitle: 'Peer vouches, endorsed portfolio items', max: 250, pct: 25, color: 'bg-blue-500' },
  { label: 'Self-Reported', subtitle: 'Tool declarations, uploaded artifacts, profile', max: 150, pct: 15, color: 'bg-amber-500' },
];

const tiers = [
  { Icon: LuPackage, label: 'Shipper', range: '50-249' },
  { Icon: LuHammer, label: 'Builder', range: '250-499' },
  { Icon: LuRocket, label: 'Captain', range: '500-749' },
  { Icon: LuTrophy, label: 'Legend', range: '750+' },
];

export default function ScoreBreakdown() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-secondary">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Your GTM Commit Score: 0 to 1,000
        </h2>
        <p className="text-center text-fg-secondary mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Verified proof counts most. Self-reported claims count least. That&apos;s the point.
        </p>

        <div className="space-y-4 mt-8 sm:mt-12">
          {bars.map((b) => (
            <div key={b.label} className="bg-white p-4 sm:p-5 rounded-card border border-surface-border">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-sm">{b.label}</span>
                  <span className="text-xs text-fg-muted ml-2 hidden sm:inline">{b.subtitle}</span>
                </div>
                <span className="text-xs sm:text-sm text-fg-muted font-mono">up to {b.max} pts</span>
              </div>
              <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
          {tiers.map((t) => (
            <span key={t.label} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-surface-border text-xs sm:text-sm font-medium inline-flex items-center gap-1.5">
              <t.Icon size={14} className="text-brand" /> {t.label} ({t.range})
            </span>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/about#scoring" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            See full scoring methodology →
          </Link>
        </div>
      </div>
    </section>
  );
}
