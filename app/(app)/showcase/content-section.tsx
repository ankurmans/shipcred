'use client';

import { useState } from 'react';
import type { ContentProof } from '@/types';
import { analytics } from '@/lib/analytics';

interface Props {
  content: ContentProof[];
  setContent: (c: ContentProof[]) => void;
}

export default function ContentProofSection({ content, setContent }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/content-proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      analytics.contentProofAdded(item.platform || 'unknown');
      setContent([item, ...content]);
      setForm({ url: '', description: '' });
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content proof?')) return;
    await fetch(`/api/content-proofs?id=${id}`, { method: 'DELETE' });
    analytics.contentProofDeleted();
    setContent(content.filter(c => c.id !== id));
  };

  const platformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      twitter: 'Twitter/X', linkedin: 'LinkedIn', substack: 'Substack',
      beehiiv: 'Beehiiv', medium: 'Medium', github: 'GitHub', blog: 'Blog', other: 'Other',
    };
    return labels[platform] || platform;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-fg-secondary">
          Blog posts, Twitter threads, LinkedIn posts, and newsletters about your AI-native GTM work.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand btn-sm shrink-0">
          {showForm ? 'Cancel' : 'Add Content'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-secondary rounded-card p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Content URL</label>
            <input
              type="url"
              required
              placeholder="https://twitter.com/... or https://your-blog.substack.com/p/..."
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
            />
            <p className="text-xs text-fg-muted mt-1">We auto-detect the platform and extract metadata</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
            <textarea
              rows={2}
              placeholder="What is this content about?"
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-brand btn-sm" disabled={saving}>
            {saving ? 'Adding...' : 'Add Content Proof'}
          </button>
        </form>
      )}

      {content.length === 0 ? (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-lg">No published content yet.</p>
          <p className="text-sm mt-1">Add blog posts, Twitter threads, or newsletters about your AI-native work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {content.map(item => (
            <div key={item.id} className="bg-surface-secondary rounded-card p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{item.title || 'Untitled'}</h3>
                  {item.url_verified ? (
                    <span className="badge bg-green-100 text-green-700">Verified</span>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700">Pending</span>
                  )}
                </div>
                <p className="text-xs text-fg-muted mt-0.5">
                  {platformLabel(item.platform)}
                  {item.estimated_word_count && ` · ~${item.estimated_word_count.toLocaleString()} words`}
                </p>
                {item.description && (
                  <p className="text-xs text-fg-secondary mt-1 line-clamp-1">{item.description}</p>
                )}
                {item.tools_mentioned.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.tools_mentioned.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-fg-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">
                  Visit
                </a>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
