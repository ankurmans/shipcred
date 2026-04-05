'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TOOL_OPTIONS = [
  'claude_code', 'cursor', 'copilot', 'aider', 'windsurf',
  'lovable', 'bolt', 'v0', 'replit', 'clay',
];

const CATEGORIES = [
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'automation', label: 'Automation' },
  { value: 'outbound_system', label: 'Outbound System' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'app', label: 'App' },
  { value: 'other', label: 'Other' },
];

export default function NewPortfolioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    tools_used: [] as string[],
  });

  const toggleTool = (tool: string) => {
    setForm({
      ...form,
      tools_used: form.tools_used.includes(tool)
        ? form.tools_used.filter(t => t !== tool)
        : [...form.tools_used, tool],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/portfolio');
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">Add Project</h1>
      <p className="text-base-content/60 mt-1">Add a shipped project to your portfolio.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg">
        <div className="form-control">
          <label className="label"><span className="label-text">Project Title</span></label>
          <input
            type="text"
            className="input input-bordered"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="My Landing Page"
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Description</span></label>
          <textarea
            className="textarea textarea-bordered"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What you built, how you built it, what tools you used..."
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Live URL</span></label>
          <input
            type="url"
            className="input input-bordered"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Category</span></label>
          <select
            className="select select-bordered"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Tools Used</span></label>
          <div className="flex flex-wrap gap-2">
            {TOOL_OPTIONS.map(tool => (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`badge badge-lg cursor-pointer ${
                  form.tools_used.includes(tool) ? 'badge-primary' : 'badge-ghost'
                }`}
              >
                {tool.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs" /> : null}
            Add Project
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
