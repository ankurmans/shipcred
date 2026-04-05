'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuMenu, LuX } from 'react-icons/lu';

const NAV_ITEMS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/proofs', label: 'Proofs' },
  { href: '/profile/edit', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export default function AppNavLinks({ username }: { username: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-5">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            {item.label}
          </Link>
        ))}
        {username && (
          <Link href={`/${username}`} className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">
            View Public
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setOpen(!open)} className="sm:hidden p-2 -mr-2 text-fg-secondary">
        {open ? <LuX size={22} /> : <LuMenu size={22} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-surface-border z-50 px-4 py-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block text-sm text-fg-secondary hover:text-fg-primary py-2">
              {item.label}
            </Link>
          ))}
          {username && (
            <Link href={`/${username}`} onClick={() => setOpen(false)} className="block text-sm text-fg-secondary hover:text-fg-primary py-2">
              View Public
            </Link>
          )}
        </div>
      )}
    </>
  );
}
