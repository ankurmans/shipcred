'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuPackageCheck, LuSend, LuCircleCheck, LuCircleX, LuArrowLeft } from 'react-icons/lu';

const CATEGORIES = [
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'integration', label: 'New Integration' },
  { value: 'other', label: 'Other' },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'feature',
    title: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [issueUrl, setIssueUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIssueUrl(data.issueUrl);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <LuCircleCheck className="text-green-500" size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-fg-primary mb-2">
            Thanks for your feedback!
          </h1>
          <p className="text-fg-secondary mb-6">
            Your suggestion has been submitted. You can track it and vote on others on GitHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {issueUrl && (
              <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand btn-sm"
              >
                View on GitHub
              </a>
            )}
            <Link href="/" className="btn-ghost btn-sm">
              <LuArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Nav */}
      <nav className="border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-sm font-bold text-brand inline-flex items-center gap-1.5">
            <LuPackageCheck size={16} /> gtmcommit
          </Link>
          <Link href="/" className="text-xs text-fg-muted hover:text-fg-primary transition-colors inline-flex items-center gap-1">
            <LuArrowLeft size={14} /> Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-fg-primary mb-2">
          Request a Feature
        </h1>
        <p className="text-fg-secondary mb-8">
          Help us build what matters. No account needed — just tell us what you want.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Email (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-fg-secondary mb-1.5">
                Name <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-fg-primary placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-fg-secondary mb-1.5">
                Email <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-fg-primary placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-fg-secondary mb-1.5">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-fg-secondary mb-1.5">
              Title <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Support Windsurf commit detection"
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-fg-primary placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-fg-secondary mb-1.5">
              Description <span className="text-brand">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="What would you like to see? Why would it be useful?"
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-fg-primary placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-y"
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              <LuCircleX size={16} />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-brand w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              'Submitting...'
            ) : (
              <>
                Submit Feedback <LuSend size={16} />
              </>
            )}
          </button>

          <p className="text-xs text-fg-muted text-center">
            Submissions are posted as GitHub issues so the community can upvote and discuss.
          </p>
        </form>
      </div>
    </div>
  );
}
