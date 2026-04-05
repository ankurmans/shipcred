import { LuCircleX, LuCircleCheck, LuPackageCheck } from 'react-icons/lu';

export default function Problem() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-secondary">
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-mono text-sm text-brand font-semibold tracking-wide mb-3">
          GTM ENGINEER ROLES: +205% YoY
        </p>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Everyone claims they&apos;re AI-native.{' '}
          <span className="text-brand">Who&apos;s actually shipping?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="p-5 sm:p-6 rounded-card border-2 border-red-200 bg-white">
            <h3 className="font-display text-lg sm:text-xl font-bold text-red-500 mb-3 sm:mb-4">The Talker</h3>
            <ul className="space-y-2 text-sm text-fg-secondary">
              <li>Lists &ldquo;AI Tools&rdquo; in LinkedIn skills</li>
              <li>Shares ChatGPT screenshots</li>
              <li>Says &ldquo;I use Claude&rdquo; in interviews</li>
              <li>Zero commits. Zero shipped projects.</li>
            </ul>
            <div className="mt-3 sm:mt-4 text-sm font-semibold text-red-500 flex items-center gap-1.5">
              <LuCircleX size={16} /> Proof: None
            </div>
          </div>
          <div className="p-5 sm:p-6 rounded-card border-2 border-green-200 bg-white">
            <h3 className="font-display text-lg sm:text-xl font-bold text-green-600 mb-3 sm:mb-4">The Doer</h3>
            <ul className="space-y-2 text-sm text-fg-secondary">
              <li>Built 3 outbound landing pages with Claude Code</li>
              <li>Automated lead enrichment with Clay + Cursor</li>
              <li>Shipped AI-powered email sequences</li>
              <li>47 verified AI commits this quarter</li>
            </ul>
            <div className="mt-3 sm:mt-4 text-sm font-semibold text-green-600 flex items-center gap-1.5">
              <LuCircleCheck size={16} /> Proof: Verified on GitHub
            </div>
          </div>
          <div className="p-5 sm:p-6 rounded-card border-2 border-brand bg-white shadow-card-hover relative">
            <div className="absolute -top-3 left-5 sm:left-6 bg-brand text-white text-xs font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1">
              <LuPackageCheck size={12} /> GTM COMMIT
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-brand mb-3 sm:mb-4">The Profile</h3>
            <ul className="space-y-2 text-sm text-fg-secondary">
              <li>Auto-detects AI commits from GitHub</li>
              <li>Verifies Claude Code, Cursor, Copilot</li>
              <li>Portfolio of shipped projects</li>
              <li>Peer vouches from other builders</li>
            </ul>
            <div className="mt-3 sm:mt-4 text-sm font-semibold text-brand">
              Score: 724 / 1,000 — Captain
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
