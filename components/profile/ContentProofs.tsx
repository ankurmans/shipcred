import type { ContentProof } from '@/types';

interface Props {
  content: ContentProof[];
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter/X', linkedin: 'LinkedIn', substack: 'Substack',
  beehiiv: 'Beehiiv', medium: 'Medium', github: 'GitHub', blog: 'Blog', other: 'Other',
};

export default function ContentProofs({ content }: Props) {
  if (!content.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Published Content</h3>
      <div className="space-y-3">
        {content.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-surface-secondary rounded-card p-3 hover:bg-surface-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate">{item.title || 'Untitled'}</span>
                {item.url_verified && (
                  <span className="badge bg-green-100 text-green-700 text-[10px]">Verified</span>
                )}
              </div>
              <p className="text-xs text-fg-muted mt-0.5">
                {PLATFORM_LABELS[item.platform] || item.platform}
                {item.estimated_word_count && ` · ~${item.estimated_word_count.toLocaleString()} words`}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
