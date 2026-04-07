'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PortfolioItem } from '@/types';
import DeploymentsSection from './deployments';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<Record<string, { ok: boolean; msg: string }>>({});

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  const handleVerify = async (id: string) => {
    setVerifying(id);
    setVerifyMsg(prev => ({ ...prev, [id]: { ok: false, msg: '' } }));
    const res = await fetch('/api/portfolio/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: id }),
    });
    const data = await res.json();
    setVerifyMsg(prev => ({
      ...prev,
      [id]: { ok: data.verified || data.already_verified, msg: data.message },
    }));
    if (data.verified || data.already_verified) {
      setItems(items.map(i => i.id === id ? { ...i, verification_status: 'verified' } : i));
    }
    setVerifying(null);
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
            <div key={item.id} className="bg-surface-secondary rounded-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.verification_status === 'verified' ? (
                      <span className="badge bg-green-100 text-green-700">Verified</span>
                    ) : item.verification_status === 'vouched' ? (
                      <span className="badge bg-blue-100 text-blue-700">Vouched</span>
                    ) : (
                      <span className="badge bg-yellow-100 text-yellow-700">Self-Reported</span>
                    )}
                  </div>
                  {item.description && <p className="text-sm text-fg-secondary line-clamp-1">{item.description}</p>}
                  <div className="flex gap-1 mt-1">
                    {item.tools_used.map(t => <span key={t} className="badge bg-surface-muted text-fg-muted">{t.replace('_', ' ')}</span>)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">Visit</a>}
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
              {/* Verify ownership */}
              {item.url && item.verification_status === 'self_reported' && (
                <div className="mt-3 pt-3 border-t border-surface-border">
                  <p className="text-xs font-medium mb-2">Verify ownership — add this to your site&apos;s {'<head>'}:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-surface-muted px-3 py-2 rounded-lg font-mono text-fg-secondary overflow-x-auto">
                      &lt;meta name=&quot;gtmcommit-verify&quot; content=&quot;portfolio&quot;&gt;
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`<meta name="gtmcommit-verify" content="portfolio">`)}
                      className="text-xs text-brand hover:text-brand-dark shrink-0 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-fg-muted mt-2">Add the meta tag, deploy, then click verify.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleVerify(item.id)}
                      disabled={verifying === item.id}
                      className="btn-brand btn-sm"
                    >
                      {verifying === item.id ? 'Checking...' : 'Verify Ownership'}
                    </button>
                    {verifyMsg[item.id] && (
                      <span className={`text-xs ${verifyMsg[item.id].ok ? 'text-green-600' : 'text-red-500'}`}>
                        {verifyMsg[item.id].msg}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Platform Deployments with Meta Tag Verification */}
      <DeploymentsSection />
    </div>
  );
}
