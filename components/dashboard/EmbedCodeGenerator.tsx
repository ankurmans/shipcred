'use client';

import { useState } from 'react';
import { LuCopy, LuCheck, LuCode } from 'react-icons/lu';
import { analytics } from '@/lib/analytics';

interface EmbedCodeGeneratorProps {
  username: string;
  score: number;
  tier: string;
}

export default function EmbedCodeGenerator({ username, score, tier }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gtmcommit.com';

  const badgeUrl = `${appUrl}/api/badge/${username}`;
  const profileUrl = `${appUrl}/${username}`;

  const snippets = [
    {
      label: 'Markdown',
      id: 'md',
      code: `[![GTM Commit](${badgeUrl})](${profileUrl})`,
    },
    {
      label: 'HTML',
      id: 'html',
      code: `<a href="${profileUrl}"><img src="${badgeUrl}" alt="GTM Commit Score: ${score}" /></a>`,
    },
  ];

  const handleCopy = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code);
    analytics.embedCodeCopied(id as 'md' | 'html');
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuCode size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Embed Your Score</h2>
      </div>

      {/* Badge preview */}
      <div className="bg-white rounded-xl border border-surface-border p-4 mb-4 flex items-center justify-center">
        <img src={`/api/badge/${username}`} alt={`GTM Commit: ${score}`} />
      </div>

      <p className="text-sm text-fg-muted mb-4">
        Add this badge to your GitHub README, website, or email signature.
      </p>

      <div className="space-y-3">
        {snippets.map((s) => (
          <div key={s.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-fg-muted">{s.label}</span>
              <button
                onClick={() => handleCopy(s.id, s.code)}
                className="text-xs text-brand hover:text-brand-dark flex items-center gap-1 transition-colors"
              >
                {copied === s.id ? <><LuCheck size={12} /> Copied</> : <><LuCopy size={12} /> Copy</>}
              </button>
            </div>
            <pre className="bg-surface-inverse text-fg-inverse text-xs p-3 rounded-lg overflow-x-auto font-mono">
              {s.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
