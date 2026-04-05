'use client';

import { useEffect, useState } from 'react';
import ProfileCompletenessBar from '@/components/shared/ProfileCompletenessBar';

function computeCompleteness(form: { display_name: string; bio: string; website_url: string; linkedin_url: string; twitter_handle: string; role: string; company: string }): number {
  let score = 0;
  if (form.bio && form.bio.length > 10) score += 25;
  if (form.display_name) score += 15;
  if (form.role) score += 15;
  if (form.company) score += 10;
  if (form.website_url || form.linkedin_url || form.twitter_handle) score += 20;
  if (form.website_url && form.linkedin_url) score += 10;
  if (form.twitter_handle) score += 5;
  return Math.min(100, score);
}

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: '', bio: '', website_url: '', linkedin_url: '',
    twitter_handle: '', role: '', company: '', looking_for_work: false,
  });

  useEffect(() => {
    fetch('/api/profiles').then(r => r.json()).then(p => {
      setForm({
        display_name: p.display_name || '', bio: p.bio || '',
        website_url: p.website_url || '', linkedin_url: p.linkedin_url || '',
        twitter_handle: p.twitter_handle || '', role: p.role || '',
        company: p.company || '', looking_for_work: p.looking_for_work || false,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/profiles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
      <p className="text-fg-secondary mt-1">Update your public profile information.</p>
      <ProfileCompletenessBar completeness={computeCompleteness(form)} />
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        {[
          { label: 'Display Name', key: 'display_name', type: 'text', required: true },
          { label: 'Company', key: 'company', type: 'text' },
          { label: 'Website URL', key: 'website_url', type: 'url', placeholder: 'https://' },
          { label: 'LinkedIn URL', key: 'linkedin_url', type: 'url', placeholder: 'https://linkedin.com/in/...' },
          { label: 'Twitter Handle', key: 'twitter_handle', type: 'text', placeholder: '@handle' },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-fg-primary mb-1.5">{f.label}</label>
            <input
              type={f.type} required={f.required} placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-fg-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              value={(form as Record<string, string | boolean>)[f.key] as string}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-fg-primary mb-1.5">Bio (max 280 chars)</label>
          <textarea
            maxLength={280} rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-fg-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
            value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <span className="text-xs text-fg-muted">{form.bio.length}/280</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-primary mb-1.5">Role</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-fg-primary focus:outline-none focus:ring-2 focus:ring-brand/30" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">Select a role</option>
            {['marketer', 'sdr', 'ae', 'growth', 'founder', 'other'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-surface-border accent-brand" checked={form.looking_for_work} onChange={(e) => setForm({ ...form, looking_for_work: e.target.checked })} />
          <span className="text-sm">Open to work</span>
        </label>
        <button type="submit" className="btn-brand" disabled={saving}>
          {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
