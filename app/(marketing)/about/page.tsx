import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = { title: 'About', description: 'What is GTM Commit and why we built it.' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-display text-4xl font-bold">About GTM Commit</h1>
          <p className="text-lg text-fg-secondary mt-4"><strong>Talk is cheap. Commits aren&apos;t.</strong></p>
          <div className="mt-8 space-y-6 text-fg-secondary leading-relaxed">
            <p>The GTM Engineer role grew 205% from 2024-2025. Companies like Ramp, Intercom, and Apollo are hiring marketers who commit code. But there&apos;s no way to verify who&apos;s actually AI-native vs who just lists &ldquo;AI tools&rdquo; on their LinkedIn.</p>
            <p>GTM Commit solves this with GitHub-verified proof-of-work scoring. Connect your GitHub, and we automatically detect your AI-assisted commits. Your profile at <code className="font-mono text-brand bg-brand-50 px-1.5 py-0.5 rounded">gtmcommit.com/username</code> becomes your verifiable credential.</p>
            <h2 className="font-display text-2xl font-bold text-fg-primary pt-4">Privacy first</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We never store source code — only commit metadata</li>
              <li>Private repo names are never displayed publicly</li>
              <li>Disconnect GitHub anytime — all data deleted immediately</li>
              <li>Fully open source — audit what we collect</li>
            </ul>
            <h2 className="font-display text-2xl font-bold text-fg-primary pt-4">Open source</h2>
            <p>GTM Commit is open source under AGPL-3.0.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
