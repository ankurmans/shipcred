'use client';

import { useState } from 'react';
import { LuCopy, LuCheck, LuShare2 } from 'react-icons/lu';

interface ShareButtonProps {
  url: string;
  title?: string;
  score?: number;
  tier?: string;
}

export default function ShareButton({ url, title, score, tier }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build compelling share text
  const twitterText = score && tier
    ? `My GTM Commit Score: ${score} (${tier.charAt(0).toUpperCase() + tier.slice(1)} tier). Talk is cheap. Commits aren't. #GTMCommit #AIShipped`
    : title || 'Check out my GTM Commit profile. Talk is cheap. Commits aren\'t. #GTMCommit';

  const linkedInText = score && tier
    ? `${score} GTM Commit Score — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier. Proof I actually ship with AI, not just talk about it.`
    : title || 'My verified proof-of-work profile on GTM Commit.';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs font-medium text-fg-secondary hover:border-brand/30 hover:text-brand transition-colors"
      >
        {copied ? <><LuCheck size={12} /> Copied!</> : <><LuShare2 size={12} /> Share</>}
      </button>
    </div>
  );
}
