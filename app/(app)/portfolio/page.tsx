'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PortfolioItem } from '@/types';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">Portfolio</h1>
          <p className="text-base-content/60 mt-1">Manage your shipped projects.</p>
        </div>
        <Link href="/portfolio/new" className="btn btn-primary btn-sm">
          Add Project
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-base-content/50">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-1">Add your first shipped project to boost your score.</p>
          <Link href="/portfolio/new" className="btn btn-primary btn-sm mt-4">
            Add Your First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-8">
          {items.map((item) => (
            <div key={item.id} className="card bg-base-200">
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-base-content/60 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {item.tools_used.map(t => (
                      <span key={t} className="badge badge-xs badge-ghost">{t.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost">
                      Visit
                    </a>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="btn btn-xs btn-ghost text-error">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
