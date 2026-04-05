export default function CTA() {
  return (
    <section className="py-20 px-4 bg-primary text-primary-content">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-dm-sans)]">
          What&apos;s your ShipCred?
        </h2>
        <p className="mt-4 text-primary-content/80 text-lg">
          Free. Open source. Takes 2 minutes.<br />
          Stop telling people you&apos;re AI-native. Show them.
        </p>
        <a
          href="/api/auth/github"
          className="btn btn-neutral btn-lg mt-8"
        >
          Connect GitHub & Get Scored →
        </a>
      </div>
    </section>
  );
}
