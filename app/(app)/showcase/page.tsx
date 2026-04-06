'use client';

import { useEffect, useState } from 'react';
import type { VideoProof, ContentProof, Certification, UploadedFile } from '@/types';
import { analytics } from '@/lib/analytics';
import VideoProofSection from './video-section';
import ContentProofSection from './content-section';
import CertificationSection from './certification-section';
import UploadSection from './upload-section';

type Tab = 'videos' | 'content' | 'certifications' | 'uploads';

export default function ShowcasePage() {
  const [tab, setTab] = useState<Tab>('videos');
  const switchTab = (t: Tab) => { setTab(t); analytics.showcaseTabSwitched(t); };
  const [videos, setVideos] = useState<VideoProof[]>([]);
  const [content, setContent] = useState<ContentProof[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/video-proofs').then(r => r.json()),
      fetch('/api/content-proofs').then(r => r.json()),
      fetch('/api/certifications').then(r => r.json()),
      fetch('/api/uploads').then(r => r.json()),
    ]).then(([v, c, ct, u]) => {
      setVideos(Array.isArray(v) ? v : []);
      setContent(Array.isArray(c) ? c : []);
      setCerts(Array.isArray(ct) ? ct : []);
      setUploads(Array.isArray(u) ? u : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'videos', label: 'Video Proof', count: videos.length },
    { key: 'content', label: 'Published Content', count: content.length },
    { key: 'certifications', label: 'Certifications', count: certs.length },
    { key: 'uploads', label: 'Uploaded Files', count: uploads.length },
  ];

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-bold">Showcase</h1>
        <p className="text-fg-secondary mt-1">
          Add videos, content, certifications, and skill files to showcase your AI expertise.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-6 border-b border-surface-border overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === t.key
                ? 'border-brand text-brand'
                : 'border-transparent text-fg-muted hover:text-fg-secondary'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-surface-muted">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === 'videos' && (
          <VideoProofSection videos={videos} setVideos={setVideos} />
        )}
        {tab === 'content' && (
          <ContentProofSection content={content} setContent={setContent} />
        )}
        {tab === 'certifications' && (
          <CertificationSection certs={certs} setCerts={setCerts} />
        )}
        {tab === 'uploads' && (
          <UploadSection uploads={uploads} setUploads={setUploads} />
        )}
      </div>
    </div>
  );
}
