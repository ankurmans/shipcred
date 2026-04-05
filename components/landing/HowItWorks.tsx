export default function HowItWorks() {
  const steps = [
    {
      icon: '🔗',
      title: 'Connect GitHub',
      body: 'We scan your commits for AI tool signatures — Claude Code, Copilot, Cursor, Aider, and more. Private repo data stays private. We only count the commits, never store code.',
    },
    {
      icon: '🛠️',
      title: 'Build Your Profile',
      body: 'Add your shipped projects, declare your tools, write your bio. Other builders can vouch for your work. The more proof, the higher your score.',
    },
    {
      icon: '🚀',
      title: 'Share Your ShipCred',
      body: 'Your profile at shipcred.io/username is your verifiable credential. Drop it in your LinkedIn bio, Twitter, job applications. Let the commits speak for themselves.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-base-200">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center font-[family-name:var(--font-dm-sans)]">
          Three steps. Two minutes. Permanent proof.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="text-xs text-primary font-bold mb-2">STEP {i + 1}</div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-base-content/60 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
