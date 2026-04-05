export default function Privacy() {
  const items = [
    {
      icon: '🔒',
      text: 'We never store source code — only commit metadata (timestamp, diff stats, AI tool detection)',
    },
    {
      icon: '🙈',
      text: 'Private repo names are never displayed — we show "47 commits across 3 private repos," not repo names',
    },
    {
      icon: '🗑️',
      text: 'Disconnect anytime — all your commit data is deleted immediately',
    },
    {
      icon: '🔍',
      text: 'Fully open source — audit exactly what we collect on GitHub',
    },
  ];

  return (
    <section className="py-20 px-4 bg-base-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center font-[family-name:var(--font-dm-sans)]">
          Your code stays yours. We just count the commits.
        </h2>

        <div className="space-y-4 mt-12">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-base-content/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
