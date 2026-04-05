'use client';

import { useEffect, useState } from 'react';

interface Proof {
  id: string;
  source_type: string;
  project_url: string;
  project_name: string | null;
  verification_status: string;
  verification_code: string | null;
  ownership_verified: boolean;
  proof_score: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  vercel: 'Vercel', lovable: 'Lovable', bolt: 'Bolt.new', v0: 'v0.dev',
  replit: 'Replit', railway: 'Railway', netlify: 'Netlify', figma: 'Figma',
  fly: 'Fly.io', custom_url: 'Website',
};

export default function DeploymentsSection() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<Record<string, { ok: boolean; msg: string }>>({});

  useEffect(() => {
    fetch('/api/proofs').then(r => r.json()).then(d => {
      setProofs(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_url: url, project_name: name || null }),
    });
    if (res.ok) {
      const proof = await res.json();
      setProofs([proof, ...proofs]);
      setUrl('');
      setName('');
      setShowAdd(false);
    }
    setSaving(false);
  };

  const handleVerifyOwnership = async (proofId: string) => {
    setVerifying(proofId);
    setVerifyMsg(prev => ({ ...prev, [proofId]: { ok: false, msg: '' } }));

    const res = await fetch('/api/proofs/verify-ownership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof_id: proofId }),
    });
    const data = await res.json();

    setVerifyMsg(prev => ({
      ...prev,
      [proofId]: { ok: data.verified || data.already_verified, msg: data.message },
    }));

    if (data.verified || data.already_verified) {
      setProofs(proofs.map(p => p.id === proofId ? { ...p, ownership_verified: true, verification_status: 'verified' } : p));
    }
    setVerifying(null);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-bold">Platform Deployments</h2>
          <p className="text-fg-secondary text-sm mt-0.5">Add your Vercel, Lovable, Bolt, v0 projects. Verify ownership with a meta tag.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-brand btn-sm">{showAdd ? 'Cancel' : 'Add Deployment'}</button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-surface-secondary rounded-card p-5 mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Deployment URL</label>
            <input type="url" required placeholder="https://my-app.vercel.app" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
            <p className="text-xs text-fg-muted mt-1">Vercel, Lovable, Bolt, v0, Replit, Netlify, Railway, or any URL</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Project Name (optional)</label>
            <input type="text" placeholder="My Landing Page" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <button type="submit" className="btn-brand btn-sm" disabled={saving}>{saving ? 'Adding...' : 'Add Deployment'}</button>
        </form>
      )}

      {proofs.length === 0 ? (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-lg">No deployments yet.</p>
          <p className="text-sm mt-1">Add your Lovable, Vercel, Bolt, or v0 project URLs.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {proofs.map(proof => (
            <div key={proof.id} className="bg-surface-secondary rounded-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{proof.project_name || proof.project_url}</span>
                    <span className="badge bg-surface-muted text-fg-muted">{PLATFORM_LABELS[proof.source_type] || proof.source_type}</span>
                    {proof.ownership_verified ? (
                      <span className="badge bg-green-100 text-green-700">Owner Verified</span>
                    ) : proof.verification_status === 'verified' ? (
                      <span className="badge bg-blue-100 text-blue-700">URL Live</span>
                    ) : (
                      <span className="badge bg-yellow-100 text-yellow-700">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5 truncate">{proof.project_url}</p>
                </div>
                <a href={proof.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary shrink-0">Visit</a>
              </div>

              {/* Meta tag verification section */}
              {!proof.ownership_verified && proof.verification_code && (
                <div className="mt-3 p-3 rounded-lg bg-surface-primary border border-surface-border">
                  <p className="text-xs font-medium mb-2">Prove you own this site — add this to your site&apos;s {'<head>'}:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-surface-muted px-3 py-2 rounded-lg font-mono text-fg-secondary overflow-x-auto">
                      &lt;meta name=&quot;gtmcommit-verify&quot; content=&quot;{proof.verification_code}&quot;&gt;
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`<meta name="gtmcommit-verify" content="${proof.verification_code}">`);
                      }}
                      className="text-xs text-brand hover:text-brand-dark shrink-0 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-fg-muted mt-2">
                    Prompt your AI tool: &quot;Add this meta tag to the head of my site&quot; — then deploy.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleVerifyOwnership(proof.id)}
                      disabled={verifying === proof.id}
                      className="btn-brand btn-sm"
                    >
                      {verifying === proof.id ? 'Checking...' : 'Verify Ownership'}
                    </button>
                    {verifyMsg[proof.id] && (
                      <span className={`text-xs ${verifyMsg[proof.id].ok ? 'text-green-600' : 'text-red-500'}`}>
                        {verifyMsg[proof.id].msg}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {proof.ownership_verified && (
                <p className="text-xs text-green-600 mt-2">Ownership verified via meta tag — Tier 1 proof (30 pts)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
