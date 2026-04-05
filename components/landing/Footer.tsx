import Link from 'next/link';
import { LuPackageCheck } from 'react-icons/lu';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border-dark bg-surface-inverse text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-brand inline-flex items-center gap-1.5"><LuPackageCheck size={16} /> gtmcommit</span>
          <span className="text-xs text-white/40 hidden sm:inline">Talk is cheap. Commits aren&apos;t.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">About</Link>
          <Link href="/leaderboard" className="text-xs text-white/40 hover:text-white/70 transition-colors">Leaderboard</Link>
          <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy</Link>
          <Link href="/updates" className="text-xs text-white/40 hover:text-white/70 transition-colors">Updates</Link>
          <Link href="/feedback" className="text-xs text-white/40 hover:text-white/70 transition-colors">Feedback</Link>
        </div>
        <div className="text-xs text-white/30">
          Built with Claude Code by{' '}
          <a href="https://twitter.com/AnkurShrestha" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">
            @AnkurShrestha
          </a>
        </div>
      </div>
      <div className="text-center py-3 sm:py-4 text-[10px] text-white/20">
        © 2026 GTM Commit. All rights reserved.
      </div>
    </footer>
  );
}
