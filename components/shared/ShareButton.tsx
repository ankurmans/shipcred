'use client';

import { useState } from 'react';

export default function ShareButton({ url, title = 'Check out my GTM Commit' }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy} className="btn-ghost btn-sm">
        {copied ? '✓ Copied!' : 'Copy URL'}
      </button>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
        𝕏
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
        in
      </a>
    </div>
  );
}
