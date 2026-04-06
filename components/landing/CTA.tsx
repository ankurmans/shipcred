'use client';

import { useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';

export default function CTA() {
  const [username, setUsername] = useState('');
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-surface-inverse text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
          What&apos;s your GTM Commit?
        </h2>
        <p className="mt-3 sm:mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
          Free forever. Takes 2 minutes. Your score is waiting.
        </p>

        {/* URL input CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 sm:mt-8 max-w-lg mx-auto">
          <div className="flex items-center border border-surface-border-dark rounded-full px-4 sm:px-5 py-3 bg-white/10 flex-1 focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand transition-all">
            <span className="text-white/40 font-mono text-sm">gtmcommit.com/</span>
            <input
              type="text"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              className="bg-transparent font-mono text-sm font-bold text-white outline-none flex-1 min-w-0 placeholder:text-white/20"
            />
          </div>
          <a
            href={`/login${username ? `?username=${encodeURIComponent(username)}` : ''}`}
            className="btn-brand whitespace-nowrap text-center justify-center"
          >
            CLAIM YOUR SCORE <LuArrowRight size={16} />
          </a>
        </div>

        <p className="mt-4 text-sm text-white/40">
          Join the first builders proving they ship.
        </p>
      </div>
    </section>
  );
}
