import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
      <div className="grid grid-flow-col gap-6">
        <Link href="/about" className="link link-hover">About</Link>
        <Link href="/leaderboard" className="link link-hover">Leaderboard</Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="link link-hover">GitHub</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="link link-hover">Twitter</a>
      </div>
      <div>
        <p className="font-bold text-lg font-[family-name:var(--font-dm-sans)]">
          ShipCred
        </p>
        <p className="text-sm text-neutral-content/60">
          Talk is cheap. Commits aren&apos;t.
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-content/60">
          Built with Claude Code by{' '}
          <a
            href="https://twitter.com/AnkurShrestha"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            @AnkurShrestha
          </a>
        </p>
      </div>
      <div>
        <p className="text-xs text-neutral-content/40">
          © 2026 ShipCred. Open source under AGPL-3.0.
        </p>
      </div>
    </footer>
  );
}
