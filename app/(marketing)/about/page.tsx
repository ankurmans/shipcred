import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuLock, LuEyeOff, LuTrash2, LuSearch, LuArrowRight } from 'react-icons/lu';

export const metadata = { title: 'About', description: 'What is GTM Commit, why we built it, and how it works.' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="py-16 sm:py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Talk is cheap.<br />Commits aren&apos;t.
            </h1>
            <p className="text-lg text-fg-secondary mt-6 leading-relaxed">
              GTM Commit is the proof-of-work score for AI-native GTM professionals. Connect your GitHub, add your shipped projects, and get a verified profile that proves you actually build — not just talk about it.
            </p>
          </div>
        </section>

        {/* Why this exists */}
        <section className="py-12 sm:py-16 px-6 bg-surface-secondary">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Why GTM Commit exists</h2>
            <div className="mt-6 space-y-4 text-fg-secondary leading-relaxed">
              <p>
                Job descriptions now say <strong>&ldquo;extremely AI-pilled required.&rdquo;</strong> Ramp is hiring Agentic Operators at $168-231K. Notion wants a GTM AI + Innovation Manager. Stripe has three Agentic Commerce roles open. Lovable&apos;s GTM lead wants an EA who&apos;s &ldquo;completely AI-pilled.&rdquo;
              </p>
              <p>
                The GTM Engineer role grew 205% from 2024 to 2025. Companies want marketers, SDRs, and growth operators who ship with AI tools — not just list them on LinkedIn.
              </p>
              <p>
                But there&apos;s no way to verify who&apos;s actually building vs who&apos;s just talking. LinkedIn skills are self-reported. Certifications prove you passed a test, not that you shipped anything. Conference badges prove attendance, not output.
              </p>
              <p>
                <strong>GTM Commit fixes this.</strong> We scan your GitHub commits for AI tool signatures — Claude Code, Cursor, Copilot, Aider, Windsurf, Devin, and more — and generate a verified score that proves you ship.
              </p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-12 sm:py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Who it&apos;s for</h2>
            <div className="mt-6 space-y-3">
              {[
                { title: 'Agentic Operators', desc: 'Building fleets of AI agents for marketing, growth, and revenue ops.' },
                { title: 'Growth & GTM Engineers', desc: 'Shipping landing pages, automating outbound, deploying with AI daily.' },
                { title: 'AI-Pilled EAs & Ops', desc: 'Running workflows, building internal tools, the AI power user on your team.' },
                { title: 'Founders & Indie Hackers', desc: 'Building and shipping products with AI tools — proving velocity to investors and customers.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-fg-primary">{item.title}</span>
                    <span className="text-fg-secondary"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-fg-secondary leading-relaxed">
              If you use Claude Code, Cursor, Copilot, Lovable, Bolt, v0, Replit, or any AI tool to do real work — GTM Commit is your verified credential.
            </p>
          </div>
        </section>

        {/* How scoring works */}
        <section className="py-12 sm:py-16 px-6 bg-surface-secondary">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">How the score works</h2>
            <p className="mt-4 text-fg-secondary leading-relaxed">
              Your GTM Commit Score ranges from 0 to 1,000. It&apos;s weighted by verification level — verified proof counts the most, self-reported claims count the least. That&apos;s the point.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Auto-Verified', pts: 'up to 600 pts', desc: 'AI-assisted commits detected from GitHub. Highest weight because it\'s verified and unfakeable. We detect 18+ AI tools automatically.' },
                { label: 'Community Verified', pts: 'up to 250 pts', desc: 'Shipped projects with URLs, screenshots, and peer vouches from other GTM Commit members.' },
                { label: 'Self-Reported', pts: 'up to 150 pts', desc: 'Tools you declare and profile completeness. Lowest weight — verified automatically if detected in your commits.' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-card border border-surface-border bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-fg-primary">{item.label}</span>
                    <span className="text-sm font-mono text-brand">{item.pts}</span>
                  </div>
                  <p className="text-sm text-fg-secondary mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-surface-secondary border border-surface-border">📦 Shipper <span className="text-fg-muted">50+</span></span>
              <span className="px-3 py-1 rounded-full bg-surface-secondary border border-surface-border">🔨 Builder <span className="text-fg-muted">250+</span></span>
              <span className="px-3 py-1 rounded-full bg-surface-secondary border border-surface-border">🚀 Captain <span className="text-fg-muted">500+</span></span>
              <span className="px-3 py-1 rounded-full bg-surface-secondary border border-surface-border">🏆 Legend <span className="text-fg-muted">750+</span></span>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-12 sm:py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Your code stays yours</h2>
            <p className="mt-4 text-fg-secondary leading-relaxed">
              We know you&apos;re giving us access to private repos. We take that seriously.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { Icon: LuLock, text: 'We never store source code — only commit metadata (timestamp, diff stats, AI tool detection)' },
                { Icon: LuEyeOff, text: 'Private repo names are never displayed — we show "47 commits across 3 private repos," not repo names' },
                { Icon: LuTrash2, text: 'Disconnect anytime — all your commit data is deleted immediately' },
                { Icon: LuSearch, text: 'Transparent by design — read our privacy policy to see exactly what we collect' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <item.Icon size={18} className="text-brand" />
                  </div>
                  <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built by */}
        <section className="py-12 sm:py-16 px-6 bg-surface-secondary">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Built by</h2>
            <p className="mt-4 text-fg-secondary leading-relaxed">
              GTM Commit is built by{' '}
              <a href="https://www.linkedin.com/in/ankur-shrestha/" target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
                Ankur Shrestha
              </a>
              {' '}with Claude Code. The entire codebase — every component, every API route, every line — was shipped using the same AI tools we verify on your profile.
            </p>
            <p className="mt-3 text-fg-secondary leading-relaxed">
              We&apos;re building the credential layer for the AI-native GTM movement. If you believe proof-of-work matters more than proof-of-talk, you&apos;re in the right place.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">What&apos;s your GTM Commit Score?</h2>
            <p className="text-fg-secondary mt-3">Free to start. Takes 2 minutes. Stop telling people you&apos;re AI-native — show them.</p>
            <a
              href="/login"
              className="btn-brand mt-6 inline-flex"
            >
              CLAIM YOUR SCORE <LuArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
