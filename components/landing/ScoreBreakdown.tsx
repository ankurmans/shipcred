export default function ScoreBreakdown() {
  const buckets = [
    {
      label: 'GitHub Commits',
      max: 500,
      description:
        'Auto-detected AI tool usage from your commit history. Highest weight because it\'s verified and unfakeable.',
      color: 'progress-primary',
    },
    {
      label: 'Portfolio Projects',
      max: 250,
      description:
        'Shipped work you can show. URLs, screenshots, walkthroughs. Community-vouched projects score higher.',
      color: 'progress-secondary',
    },
    {
      label: 'Peer Vouches',
      max: 150,
      description:
        'Other ShipCred members endorse your work. One vouch per person. You can\'t vouch for yourself.',
      color: 'progress-accent',
    },
    {
      label: 'Tool Declarations',
      max: 100,
      description:
        'Self-declared tools you use. Lowest weight. Verified automatically if detected in your commits.',
      color: 'progress-info',
    },
  ];

  return (
    <section className="py-20 px-4 bg-base-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center font-[family-name:var(--font-dm-sans)]">
          Your ShipCred Score: 0 to 1,000
        </h2>
        <p className="text-center text-base-content/60 mt-4 max-w-2xl mx-auto">
          Weighted by verification level. Verified proof from GitHub counts the most.
          Self-reported claims count the least. That&apos;s the point.
        </p>

        <div className="space-y-6 mt-12">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="card bg-base-200 p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{bucket.label}</span>
                <span className="text-sm text-base-content/50">up to {bucket.max} pts</span>
              </div>
              <progress
                className={`progress ${bucket.color} w-full h-3`}
                value={bucket.max}
                max={1000}
              />
              <p className="text-sm text-base-content/60 mt-2">{bucket.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {[
            { emoji: '📦', label: 'Shipper', range: '50-249' },
            { emoji: '🔨', label: 'Builder', range: '250-499' },
            { emoji: '🚀', label: 'Captain', range: '500-749' },
            { emoji: '🏆', label: 'Legend', range: '750+' },
          ].map((tier) => (
            <div key={tier.label} className="badge badge-lg badge-outline gap-1 py-3 px-4">
              {tier.emoji} {tier.label} ({tier.range})
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
