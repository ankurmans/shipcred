'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    website_url: '',
    linkedin_url: '',
    twitter_handle: '',
    role: '',
    company: '',
    looking_for_work: false,
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const profile = await res.json();
        setForm({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          website_url: profile.website_url || '',
          linkedin_url: profile.linkedin_url || '',
          twitter_handle: profile.twitter_handle || '',
          role: profile.role || '',
          company: profile.company || '',
          looking_for_work: profile.looking_for_work || false,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">Edit Profile</h1>
      <p className="text-base-content/60 mt-1">Update your public profile information.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg">
        <div className="form-control">
          <label className="label"><span className="label-text">Display Name</span></label>
          <input
            type="text"
            className="input input-bordered"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Bio (max 280 chars)</span></label>
          <textarea
            className="textarea textarea-bordered"
            maxLength={280}
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <label className="label"><span className="label-text-alt">{form.bio.length}/280</span></label>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Role</span></label>
          <select
            className="select select-bordered"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select a role</option>
            <option value="marketer">Marketer</option>
            <option value="sdr">SDR</option>
            <option value="ae">Account Executive</option>
            <option value="growth">Growth</option>
            <option value="founder">Founder</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Company</span></label>
          <input
            type="text"
            className="input input-bordered"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Website URL</span></label>
          <input
            type="url"
            className="input input-bordered"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            placeholder="https://"
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">LinkedIn URL</span></label>
          <input
            type="url"
            className="input input-bordered"
            value={form.linkedin_url}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Twitter Handle</span></label>
          <input
            type="text"
            className="input input-bordered"
            value={form.twitter_handle}
            onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })}
            placeholder="@handle"
          />
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={form.looking_for_work}
              onChange={(e) => setForm({ ...form, looking_for_work: e.target.checked })}
            />
            <span className="label-text">Open to work</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-xs" /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
}
