'use client';

import { useState, useRef, useEffect } from 'react';
import { LuCopy, LuCheck, LuShare2, LuLinkedin } from 'react-icons/lu';
import { FaXTwitter } from 'react-icons/fa6';
import { analytics } from '@/lib/analytics';

interface ShareButtonProps {
  url: string;
  title?: string;
  score?: number;
  tier?: string;
}

export default function ShareButton({ url, title, score, tier }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    analytics.profileShared('copy', url);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : '';

  const twitterText = score && tier
    ? `My GTM Commit Score: ${score} (${tierLabel} tier). Talk is cheap. Commits aren't. #GTMCommit #AIShipped`
    : title || 'Check out my GTM Commit profile. Talk is cheap. Commits aren\'t. #GTMCommit';

  const handleTwitter = () => {
    analytics.profileShared('twitter', url);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setOpen(false);
  };

  const handleLinkedIn = () => {
    analytics.profileShared('linkedin', url);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs font-medium text-fg-secondary hover:border-brand/30 hover:text-brand transition-colors"
      >
        <LuShare2 size={12} /> Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-surface-border rounded-xl shadow-lg py-1 min-w-[160px]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-secondary hover:bg-surface-secondary transition-colors"
          >
            {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleTwitter}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-secondary hover:bg-surface-secondary transition-colors"
          >
            <FaXTwitter size={14} />
            Share on X
          </button>
          <button
            onClick={handleLinkedIn}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-secondary hover:bg-surface-secondary transition-colors"
          >
            <LuLinkedin size={14} />
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  );
}
