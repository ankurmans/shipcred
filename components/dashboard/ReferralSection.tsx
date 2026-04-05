'use client';

import { useState } from 'react';
import { LuCopy, LuCheck, LuUsers } from 'react-icons/lu';

export default function ReferralSection({
  username,
  referralCount,
}: {
  username: string;
  referralCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gtmcommit.com';
  const referralLink = `${appUrl}/?ref=${username}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-secondary rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <LuUsers size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold">Refer Builders</h2>
      </div>
      <p className="text-sm text-fg-secondary mb-3">
        Invite others to join. Referred users who complete a profile earn you bonus score points (5 pts each, max 50).
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-surface-border rounded-lg px-3 py-2 font-mono text-sm text-fg-secondary truncate">
          {referralLink}
        </div>
        <button onClick={handleCopy} className="btn-brand btn-sm shrink-0">
          {copied ? <><LuCheck size={14} /> Copied</> : <><LuCopy size={14} /> Copy</>}
        </button>
      </div>
      {referralCount > 0 && (
        <div className="mt-3 text-sm text-fg-muted">
          <span className="font-semibold text-fg-primary">{referralCount}</span> builder{referralCount !== 1 ? 's' : ''} joined via your link
        </div>
      )}
    </div>
  );
}
