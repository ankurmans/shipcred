import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'About',
  description: 'What is ShipCred and why we built it.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100">
        <div className="max-w-2xl mx-auto px-4 py-12 prose">
          <h1 className="font-[family-name:var(--font-dm-sans)]">About ShipCred</h1>

          <p className="text-lg">
            <strong>Talk is cheap. Commits aren&apos;t.</strong>
          </p>

          <p>
            The GTM Engineer role grew 205% from 2024-2025. Companies like Ramp,
            Intercom, and Apollo are hiring marketers who commit code. But there&apos;s
            no way to verify who&apos;s actually AI-native vs who just lists &ldquo;AI
            tools&rdquo; on their LinkedIn.
          </p>

          <p>
            ShipCred solves this with GitHub-verified proof-of-work scoring. Connect
            your GitHub, and we automatically detect your AI-assisted commits —
            Claude Code, Cursor, Copilot, Aider, and more. Your profile at{' '}
            <code>shipcred.io/username</code> becomes your verifiable credential.
          </p>

          <h2>Who is this for?</h2>
          <p>
            Marketers, SDRs, Account Executives, Growth Operators, and Founders who
            use AI coding tools for go-to-market work. Not just engineers — this is
            for the GTM people who are actually shipping.
          </p>

          <h2>How scoring works</h2>
          <p>
            Your ShipCred Score (0-1000) is weighted by verification level. GitHub
            commits with detected AI tool signatures carry the highest weight.
            Self-reported tool declarations carry the least. The more verified proof,
            the higher your score.
          </p>

          <h2>Privacy first</h2>
          <ul>
            <li>We never store source code — only commit metadata</li>
            <li>Private repo names are never displayed publicly</li>
            <li>Disconnect GitHub anytime — all data deleted immediately</li>
            <li>Fully open source — audit what we collect</li>
          </ul>

          <h2>Open source</h2>
          <p>
            ShipCred is open source under AGPL-3.0. You can fork, modify, and
            self-host. If you run a modified version as a hosted service, you must
            open source your changes.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
