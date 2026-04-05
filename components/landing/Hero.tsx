'use client';

import { useState } from 'react';
import { LuFlame, LuArrowRight, LuStar } from 'react-icons/lu';
import RotatingPhone from './RotatingPhone';

export default function Hero() {
  const [username, setUsername] = useState('');
  return (
    <section className="w-full">
      {/* Announcement bar */}
      <div className="w-full bg-brand-50 py-2 text-center px-4">
        <span className="text-xs sm:text-sm font-medium text-brand inline-flex items-center gap-1">
          <LuFlame size={14} />
          <span className="hidden sm:inline">Join the first builders proving they ship — claim your profile</span>
          <span className="sm:hidden">Prove you ship — claim your profile</span>
          <LuArrowRight size={14} className="ml-1" />
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Phone mockup — shows below copy on mobile via order */}
          <div className="shrink-0 order-2 lg:order-1">
            <RotatingPhone />
          </div>

          {/* Copy — shows first on mobile */}
          <div className="flex-1 max-w-xl order-1 lg:order-2 text-center lg:text-left">
            {/* URL hero */}
            <div className="flex items-center justify-center lg:justify-start gap-0 mb-4 sm:mb-6">
              <span className="font-mono text-xl sm:text-2xl md:text-3xl text-fg-primary/50">
                gtmcommit.com/
              </span>
              <span className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-brand">
                yourname
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Talk is cheap.<br />
              Commits aren&apos;t.
            </h1>

            {/* Subhead */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-fg-secondary leading-relaxed max-w-md mx-auto lg:mx-0">
              The proof-of-work profile for AI-native GTM professionals.
              Connect GitHub. Get scored. Share your credential everywhere.
            </p>

            {/* URL input CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 sm:mt-8">
              <div className="flex items-center border border-surface-border rounded-full px-4 sm:px-5 py-3 bg-white flex-1 sm:max-w-xs focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand transition-all">
                <span className="text-fg-muted font-mono text-sm">gtmcommit.com/</span>
                <input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="bg-transparent font-mono text-sm font-bold text-fg-primary outline-none flex-1 min-w-0 placeholder:text-fg-faint"
                />
              </div>
              <a
                href={`/login${username ? `?username=${encodeURIComponent(username)}` : ''}`}
                className="btn-brand whitespace-nowrap text-center justify-center"
              >
                CLAIM MY PAGE <LuArrowRight size={16} />
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-4">
              <div className="flex -space-x-2 shrink-0">
                {['#FF5C00', '#6366F1', '#06B6D4', '#EC4899', '#F59E0B'].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-brand">
                  {[...Array(5)].map((_, i) => <LuStar key={i} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-fg-secondary mt-0.5">
                  <span className="font-semibold text-fg-primary">&ldquo;Finally a way to prove I actually ship.&rdquo;</span>
                </p>
                <p className="text-xs text-fg-muted mt-0.5">
                  — Early builders who connected their GitHub
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs text-fg-muted">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                Open source
              </span>
              <span>·</span>
              <span>Free forever</span>
              <span>·</span>
              <span>2 min setup</span>
              <span>·</span>
              <span>No code stored</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
