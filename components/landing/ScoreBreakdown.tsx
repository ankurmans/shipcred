import { LuPackage, LuHammer, LuRocket, LuTrophy } from 'react-icons/lu';

const tierBuckets = [
  {
    label: 'Tier 1 — Auto-Verified',
    max: 600,
    pct: 60,
    color: 'bg-green-500',
    items: [
      'GitHub AI commits (up to 200 pts)',
      'Platform deployments — Vercel, Lovable, Replit, Bolt, v0 (up to 150 pts)',
      'Recognized certifications — OpenAI, Clay (up to 80 pts)',
      'Tool diversity bonus (up to 80 pts)',
      'Consistency bonus (up to 50 pts)',
    ],
    description: 'Machine-confirmed evidence. Cannot be faked without triggering anti-gaming rules.',
  },
  {
    label: 'Tier 2 — Community Verified',
    max: 250,
    pct: 25,
    color: 'bg-blue-500',
    items: [
      'Vouched portfolio items (up to 120 pts)',
      'Vouched uploaded artifacts (up to 60 pts)',
      'Vouched video proof (up to 60 pts)',
      'Vouched published content (up to 50 pts)',
      'Vouched certifications (up to 40 pts)',
    ],
    description: 'Requires human validation — peer vouches from other GTM Commit members.',
  },
  {
    label: 'Tier 3 — Self-Reported',
    max: 150,
    pct: 15,
    color: 'bg-amber-500',
    items: [
      'Unvouched portfolio items (up to 50 pts)',
      'Uploaded skill files (up to 45 pts)',
      'Tool declarations (up to 30 pts)',
      'Profile completeness (up to 20 pts)',
    ],
    description: 'Honor system. Lowest weight. Exists so new users aren\'t stuck at zero.',
  },
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
        <p className="text-center text-fg-secondary mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base">
          Weighted by verification level. Verified proof from GitHub counts the most.
          Self-reported claims count the least. That&apos;s the point.
        </p>
        <div className="space-y-4 sm:space-y-5 mt-8 sm:mt-12">
          {tierBuckets.map((b) => (
            <div key={b.label} className="bg-white p-4 sm:p-5 rounded-card border border-surface-border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">{b.label}</span>
                <span className="text-xs sm:text-sm text-fg-muted font-mono">up to {b.max} pts</span>
              </div>
              <div className="w-full h-2 sm:h-2.5 bg-surface-muted rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
              </div>
              <p className="text-xs sm:text-sm text-fg-secondary mt-2">{b.description}</p>
              <ul className="mt-2 space-y-1">
                {b.items.map((item) => (
                  <li key={item} className="text-xs text-fg-muted flex items-start gap-1.5">
                    <span className="text-fg-faint mt-0.5">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
      </div>
    </section>
  );
}
