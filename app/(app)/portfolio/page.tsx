'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PortfolioItem } from '@/types';
import DeploymentsSection from './deployments';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold">Portfolio</h1>
          <p className="text-fg-secondary mt-1">Manage your shipped projects.</p>
        </div>
        <Link href="/portfolio/new" className="btn-brand btn-sm">Add Project</Link>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 text-fg-muted">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-1">Add your first shipped project to boost your score.</p>
          <Link href="/portfolio/new" className="btn-brand btn-sm mt-4 inline-flex">Add Your First Project</Link>
        </div>
      ) : (
        <div className="space-y-3 mt-8">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-secondary rounded-card p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                {item.description && <p className="text-sm text-fg-secondary line-clamp-1">{item.description}</p>}
                <div className="flex gap-1 mt-1">
                  {item.tools_used.map(t => <span key={t} className="badge bg-surface-muted text-fg-muted">{t.replace('_', ' ')}</span>)}
                </div>
              </div>
              <div className="flex gap-2">
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">Visit</a>}
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Platform Deployments with Meta Tag Verification */}
      <DeploymentsSection />
    </div>
  );
}
