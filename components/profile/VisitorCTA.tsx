'use client';

import { useState, useEffect } from 'react';
import { LuArrowRight, LuX } from 'react-icons/lu';

export default function VisitorCTA() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('visitor_cta_dismissed');
    setDismissed(!!wasDismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('visitor_cta_dismissed', '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-0">
      <div className="max-w-2xl mx-auto sm:mb-4">
        <div className="gradient-brand rounded-2xl sm:rounded-full px-5 py-3.5 flex items-center justify-between gap-3 shadow-cta">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-white font-semibold text-sm sm:text-base whitespace-nowrap">
              What&apos;s YOUR score?
            </span>
            <span className="text-white/70 text-sm hidden sm:inline truncate">
              Get your GTM Commit free in 2 minutes.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 bg-white text-brand font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
            >
              Get Yours <LuArrowRight size={14} />
            </a>
            <button
              onClick={handleDismiss}
              className="text-white/50 hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              <LuX size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
