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
        className="btn-ghost btn-sm inline-flex items-center gap-1.5"
      >
        {copied ? <><LuCheck size={14} /> Copied!</> : <><LuCopy size={14} /> Copy URL</>}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost btn-sm"
        aria-label="Share on X (Twitter)"
      >
        𝕏
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost btn-sm"
        aria-label="Share on LinkedIn"
      >
        in
      </a>
    </div>
  );
}
