export default function CTA() {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-surface-inverse text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
          What&apos;s your GTM Commit?
        </h2>
        <p className="mt-3 sm:mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
          Free. Open source. Takes 2 minutes.<br />
          Stop telling people you&apos;re AI-native. Show them.
        </p>
        <a href="/api/auth/github" className="btn-brand mt-6 sm:mt-8 inline-flex">
          Connect GitHub & Get Scored →
        </a>
      </div>
    </section>
  );
}
