'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';

const TOOLS = ['claude_code', 'cursor', 'copilot', 'aider', 'windsurf', 'lovable', 'bolt', 'v0', 'replit', 'clay'];
const CATEGORIES = [
  { value: 'landing_page', label: 'Landing Page' }, { value: 'automation', label: 'Automation' },
  { value: 'outbound_system', label: 'Outbound System' }, { value: 'analytics', label: 'Analytics' },
  { value: 'app', label: 'App' }, { value: 'other', label: 'Other' },
];

export default function NewPortfolioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', url: '', category: '', tools_used: [] as string[] });

  const toggleTool = (t: string) => setForm({ ...form, tools_used: form.tools_used.includes(t) ? form.tools_used.filter(x => x !== t) : [...form.tools_used, t] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      analytics.portfolioItemAdded(form.category, form.tools_used);
      router.push('/portfolio');
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Add Project</h1>
      <p className="text-fg-secondary mt-1">Add a shipped project to your portfolio.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1.5">Project Title</label>
          <input type="text" required placeholder="My Landing Page" className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea rows={3} placeholder="What you built, how, what tools..." className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Live URL</label>
          <input type="url" placeholder="https://..." className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Tools Used</label>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(t => (
              <button key={t} type="button" onClick={() => toggleTool(t)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${form.tools_used.includes(t) ? 'bg-brand text-white' : 'bg-surface-secondary text-fg-secondary hover:bg-surface-muted'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-brand" disabled={saving}>
            {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Add Project
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
