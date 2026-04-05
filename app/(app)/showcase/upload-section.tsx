'use client';

import { useState } from 'react';
import type { UploadedFile } from '@/types';

interface Props {
  uploads: UploadedFile[];
  setUploads: (u: UploadedFile[]) => void;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  claude_md: 'CLAUDE.md',
  cursorrules: '.cursorrules',
  mcp_config: 'MCP Config',
  skill_file: 'Skill File',
};

export default function UploadSection({ uploads, setUploads }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const upload = await res.json();
      setUploads([upload, ...uploads]);
    } else {
      const data = await res.json();
      setError(data.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this upload?')) return;
    await fetch(`/api/uploads?id=${id}`, { method: 'DELETE' });
    setUploads(uploads.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-fg-secondary">
          Upload CLAUDE.md, .cursorrules, MCP configs, or skill files to prove your AI tool proficiency.
          Files are hash-checked for uniqueness across all users.
        </p>
        <label className="btn-brand btn-sm shrink-0 cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload File'}
          <input
            type="file"
            className="hidden"
            accept=".md,.json,.yaml,.yml,.txt"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {uploads.length === 0 ? (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-lg">No uploaded files yet.</p>
          <p className="text-sm mt-1">Upload your CLAUDE.md, .cursorrules, or MCP config files.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map(upload => (
            <div key={upload.id} className="bg-surface-secondary rounded-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-xs font-mono text-fg-muted shrink-0">
                {upload.file_type === 'claude_md' ? 'MD' :
                 upload.file_type === 'cursorrules' ? 'CR' :
                 upload.file_type === 'mcp_config' ? 'MCP' : 'SK'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{upload.file_name}</h3>
                  {upload.is_parsed_valid ? (
                    <span className="badge bg-green-100 text-green-700">Valid Structure</span>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700">Needs Review</span>
                  )}
                </div>
                <p className="text-xs text-fg-muted mt-0.5">
                  {FILE_TYPE_LABELS[upload.file_type] || upload.file_type}
                  {' · '}{upload.line_count} lines
                  {' · '}{(upload.file_size / 1024).toFixed(1)}KB
                </p>
                {upload.structural_markers_found.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {upload.structural_markers_found.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-fg-muted">
                        {m.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(upload.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
