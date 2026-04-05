'use client';

import { useState } from 'react';
import type { FlagType, FlagReason } from '@/types';

const REASONS: { value: FlagReason; label: string }[] = [
  { value: 'fake_commits', label: 'Fake commits' },
  { value: 'copied_file', label: 'Copied/stolen content' },
  { value: 'fake_vouch', label: 'Fake vouch' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];

interface FlagButtonProps {
  flagType: FlagType;
  targetId: string;
  targetProfileId: string;
}

export default function FlagButton({ flagType, targetId, targetProfileId }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState<FlagReason | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flag_type: flagType,
        target_id: targetId,
        target_profile_id: targetProfileId,
        reason,
        description: description || null,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
      setOpen(false);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to submit flag');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return <span className="text-xs text-fg-muted">Reported</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-fg-muted hover:text-red-500 transition-colors"
        title="Report this item"
      >
        Flag
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 w-72 bg-white border border-surface-border rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Report this item</h4>
          <select
            className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm bg-white mb-2"
            value={reason}
            onChange={e => setReason(e.target.value as FlagReason)}
          >
            <option value="">Select reason</option>
            {REASONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <textarea
            rows={2}
            placeholder="Details (optional)"
            className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm resize-none mb-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-surface-border text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
