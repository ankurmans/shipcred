'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { LuMenu, LuX } from 'react-icons/lu';

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-surface-border relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href={isLoggedIn ? '/dashboard' : '/'}>
          <Logo size={20} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/leaderboard" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            Explore
          </Link>
          <Link href="/scoring" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            Scoring
          </Link>
          <Link href="/about" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            About
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Log in</Link>
              <a href="/api/auth/github" className="btn-primary btn-sm">Claim yours</a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="sm:hidden p-2 -mr-2 text-fg-secondary">
          {open ? <LuX size={22} /> : <LuMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-surface-border z-50 px-4 py-4 space-y-3">
          <Link href="/leaderboard" onClick={() => setOpen(false)} className="block text-sm text-fg-secondary py-2">
            Explore
          </Link>
          <Link href="/scoring" onClick={() => setOpen(false)} className="block text-sm text-fg-secondary py-2">
            Scoring
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block text-sm text-fg-secondary py-2">
            About
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary btn-sm w-full text-center">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block text-sm text-fg-secondary py-2">Log in</Link>
              <a href="/api/auth/github" className="btn-primary btn-sm w-full text-center">Claim yours</a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
