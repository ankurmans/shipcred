'use client';

import { useState } from 'react';
import type { Certification } from '@/types';
import { analytics } from '@/lib/analytics';

interface Props {
  certs: Certification[];
  setCerts: (c: Certification[]) => void;
}

export default function CertificationSection({ certs, setCerts }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ cert_name: '', cert_url: '', cert_id: '', issued_at: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/certifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        issued_at: form.issued_at || null,
        cert_id: form.cert_id || null,
      }),
    });
    if (res.ok) {
      const cert = await res.json();
      analytics.certificationAdded(form.cert_name);
      setCerts([cert, ...certs]);
      setForm({ cert_name: '', cert_url: '', cert_id: '', issued_at: '' });
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    await fetch(`/api/certifications?id=${id}`, { method: 'DELETE' });
    analytics.certificationDeleted();
    setCerts(certs.filter(c => c.id !== id));
  };

  const issuerLabel = (issuer: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI', credly: 'Credly', clay: 'Clay', hubspot: 'HubSpot',
      gtm_ai_academy: 'GTM AI Academy', pma: 'Product Marketing Alliance',
      pavilion: 'Pavilion', other: 'Other',
    };
    return labels[issuer] || issuer;
  };

  const statusBadge = (status: string) => {
    if (status === 'auto_verified') return <span className="badge bg-green-100 text-green-700">Auto-Verified</span>;
    if (status === 'vouch_verified') return <span className="badge bg-blue-100 text-blue-700">Vouch-Verified</span>;
    return <span className="badge bg-yellow-100 text-yellow-700">Pending</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-fg-secondary">
          Certifications from OpenAI, Clay, HubSpot, and other recognized platforms. Known domains are auto-verified.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand btn-sm shrink-0">
          {showForm ? 'Cancel' : 'Add Certification'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-secondary rounded-card p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Certification Name</label>
            <input
              type="text"
              required
              placeholder="e.g. OpenAI API Certification"
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              value={form.cert_name}
              onChange={e => setForm({ ...form, cert_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Certificate URL</label>
            <input
              type="url"
              required
              placeholder="https://www.credly.com/badges/... or https://academy.hubspot.com/..."
              className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              value={form.cert_url}
              onChange={e => setForm({ ...form, cert_url: e.target.value })}
            />
            <p className="text-xs text-fg-muted mt-1">
              Certificates from Credly, OpenAI, Clay, and HubSpot are auto-verified by domain
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Certificate ID (optional)</label>
              <input
                type="text"
                placeholder="ABC-123-XYZ"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={form.cert_id}
                onChange={e => setForm({ ...form, cert_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Issue Date (optional)</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={form.issued_at}
                onChange={e => setForm({ ...form, issued_at: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-brand btn-sm" disabled={saving}>
            {saving ? 'Adding...' : 'Add Certification'}
          </button>
        </form>
      )}

      {certs.length === 0 ? (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-lg">No certifications yet.</p>
          <p className="text-sm mt-1">Add your AI or GTM certifications from OpenAI, Clay, HubSpot, and more.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map(cert => (
            <div key={cert.id} className="bg-surface-secondary rounded-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{cert.cert_name}</h3>
                  {statusBadge(cert.verification_status)}
                </div>
                <p className="text-xs text-fg-muted mt-0.5">
                  {issuerLabel(cert.issuer)}
                  {cert.issued_at && ` · Issued ${new Date(cert.issued_at).toLocaleDateString()}`}
                  {cert.cert_id && ` · ID: ${cert.cert_id}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={cert.cert_url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">
                  View
                </a>
                <button onClick={() => handleDelete(cert.id)} className="text-xs text-red-500 hover:text-red-700">
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
