'use client';

import { useState } from 'react';
import type { VideoProof, VideoCategory } from '@/types';

const VIDEO_CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: 'build_session', label: 'Build Session Recording' },
  { value: 'workflow_walkthrough', label: 'Workflow Walkthrough' },
  { value: 'tool_demo', label: 'Tool Demo' },
];

interface Props {
  videos: VideoProof[];
  setVideos: (v: VideoProof[]) => void;
}

export default function VideoProofSection({ videos, setVideos }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: '', category: '' as string, description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/video-proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const video = await res.json();
      setVideos([video, ...videos]);
      setForm({ url: '', category: '', description: '' });
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video proof?')) return;
    await fetch(`/api/video-proofs?id=${id}`, { method: 'DELETE' });
    setVideos(videos.filter(v => v.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-fg-secondary">
          Screen recordings from Loom, YouTube, or Vimeo showing your AI tool workflows. Min 30 seconds.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand btn-sm shrink-0">
          {showForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-secondary rounded-card p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Video URL</label>
            <input
              type="url"
              required
              placeholder="https://www.loom.com/share/... or https://youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
            />
            <p className="text-xs text-fg-muted mt-1">Supports Loom, YouTube, and Vimeo</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {VIDEO_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
            <textarea
              rows={2}
              placeholder="What does this video show?"
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-brand btn-sm" disabled={saving}>
            {saving ? 'Adding...' : 'Add Video Proof'}
          </button>
        </form>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-lg">No video proofs yet.</p>
          <p className="text-sm mt-1">Add a Loom or YouTube recording to prove your AI workflow skills.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map(video => (
            <div key={video.id} className="bg-surface-secondary rounded-card p-4 flex items-start gap-4">
              {video.thumbnail_url && (
                <img src={video.thumbnail_url} alt="" className="w-24 h-16 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{video.title || 'Untitled Video'}</h3>
                  {video.url_verified ? (
                    <span className="badge bg-green-100 text-green-700">Verified</span>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700">Pending</span>
                  )}
                </div>
                <p className="text-xs text-fg-muted mt-0.5">
                  {video.platform} {video.duration_seconds && `· ${Math.round(video.duration_seconds / 60)}min`}
                  {video.category && ` · ${video.category.replace(/_/g, ' ')}`}
                </p>
                {video.tools_mentioned.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {video.tools_mentioned.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-fg-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">
                  Watch
                </a>
                <button onClick={() => handleDelete(video.id)} className="text-xs text-red-500 hover:text-red-700">
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
