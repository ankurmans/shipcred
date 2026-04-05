'use client';

import { useEffect, useState } from 'react';
import ProfileCompletenessBar from '@/components/shared/ProfileCompletenessBar';

const PLATFORM_FIELDS = [
  { key: 'clay', label: 'Clay', placeholder: 'https://app.clay.com/workspaces/...', icon: '🧱' },
  { key: 'n8n', label: 'n8n', placeholder: 'https://n8n.io/workflows/...', icon: '⚡' },
  { key: 'lovable', label: 'Lovable', placeholder: 'https://lovable.dev/projects/...', icon: '💜' },
  { key: 'cursor', label: 'Cursor', placeholder: 'https://cursor.com/...', icon: '▶️' },
  { key: 'replit', label: 'Replit', placeholder: 'https://replit.com/@...', icon: '💻' },
  { key: 'vercel', label: 'Vercel', placeholder: 'https://vercel.com/...', icon: '▲' },
  { key: 'bolt', label: 'Bolt', placeholder: 'https://bolt.new/...', icon: '⚡' },
  { key: 'v0', label: 'v0', placeholder: 'https://v0.dev/...', icon: '🎨' },
];

interface FormState {
  display_name: string;
  bio: string;
  website_url: string;
  linkedin_url: string;
  twitter_handle: string;
  role: string;
  company: string;
  looking_for_work: boolean;
  platform_urls: Record<string, string>;
}

function computeCompleteness(form: FormState): number {
  let score = 0;
  if (form.bio && form.bio.length > 10) score += 25;
  if (form.display_name) score += 15;
  if (form.role) score += 15;
  if (form.company) score += 10;
  if (form.website_url || form.linkedin_url || form.twitter_handle) score += 20;
  if (form.website_url && form.linkedin_url) score += 10;
  if (form.twitter_handle) score += 5;
  // Platform URLs: any one filled = bonus (not per-platform)
  const hasAnyPlatform = Object.values(form.platform_urls).some(v => v && v.trim().length > 0);
  if (hasAnyPlatform) score += 10;
  return Math.min(100, score);
}

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>({
    display_name: '', bio: '', website_url: '', linkedin_url: '',
    twitter_handle: '', role: '', company: '', looking_for_work: false,
    platform_urls: {},
  });

  useEffect(() => {
    fetch('/api/profiles').then(r => r.json()).then(p => {
      setForm({
        display_name: p.display_name || '', bio: p.bio || '',
        website_url: p.website_url || '', linkedin_url: p.linkedin_url || '',
        twitter_handle: p.twitter_handle || '', role: p.role || '',
        company: p.company || '', looking_for_work: p.looking_for_work || false,
        platform_urls: p.platform_urls || {},
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/profiles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePlatformUrl = (key: string, value: string) => {
    setForm({ ...form, platform_urls: { ...form.platform_urls, [key]: value } });
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
              value={(form as unknown as Record<string, string>)[f.key] || ''}
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

        {/* Platform URLs */}
        <div className="pt-4 border-t border-surface-border">
          <h3 className="text-sm font-semibold text-fg-primary mb-1">Platform Profiles</h3>
          <p className="text-xs text-fg-muted mb-4">Link your profiles on AI/no-code platforms. These show on your public page.</p>
          <div className="space-y-3">
            {PLATFORM_FIELDS.map((pf) => (
              <div key={pf.key} className="flex items-center gap-2">
                <span className="text-lg w-7 text-center shrink-0">{pf.icon}</span>
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder={pf.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-fg-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    value={form.platform_urls[pf.key] || ''}
                    onChange={(e) => updatePlatformUrl(pf.key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-surface-border accent-brand" checked={form.looking_for_work} onChange={(e) => setForm({ ...form, looking_for_work: e.target.checked })} />
          <span className="text-sm">Open to work</span>
        </label>
        <button type="submit" className="btn-brand" disabled={saving}>
          {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
