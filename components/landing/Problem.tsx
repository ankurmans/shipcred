export default function Problem() {
  return (
    <section className="py-20 px-4 bg-base-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center font-[family-name:var(--font-dm-sans)]">
          Everyone claims they&apos;re AI-native.<br />
          Who&apos;s actually shipping?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* The Talker */}
          <div className="card bg-base-200 border-2 border-error/30">
            <div className="card-body">
              <h3 className="card-title text-error">The Talker</h3>
              <ul className="space-y-2 text-sm">
                <li>Lists &ldquo;AI Tools&rdquo; in LinkedIn skills</li>
                <li>Shares ChatGPT screenshots</li>
                <li>Says &ldquo;I use Claude&rdquo; in interviews</li>
                <li>Zero commits. Zero shipped projects.</li>
              </ul>
              <div className="mt-3 text-sm font-semibold text-error">
                Proof: ❌ None
              </div>
            </div>
          </div>

          {/* The Doer */}
          <div className="card bg-base-200 border-2 border-success/30">
            <div className="card-body">
              <h3 className="card-title text-success">The Doer</h3>
              <ul className="space-y-2 text-sm">
                <li>47 Claude Code commits this quarter</li>
                <li>Shipped 3 landing pages from terminal</li>
                <li>Built outbound automation in Cursor</li>
                <li>Clay workflows generating pipeline</li>
              </ul>
              <div className="mt-3 text-sm font-semibold text-success">
                Proof: ✅ Verified on GitHub
              </div>
            </div>
          </div>

          {/* The ShipCred Profile */}
          <div className="card bg-base-200 border-2 border-primary shadow-lg scale-[1.02]">
            <div className="card-body">
              <h3 className="card-title text-primary">The ShipCred Profile</h3>
              <ul className="space-y-2 text-sm">
                <li>Auto-detects AI commits from GitHub</li>
                <li>Verifies Claude Code, Cursor, Copilot usage</li>
                <li>Portfolio of shipped projects</li>
                <li>Peer vouches from other builders</li>
              </ul>
              <div className="mt-3 text-sm font-semibold text-primary">
                Score: 724 / 1000 — Captain
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
