import { LuExternalLink } from 'react-icons/lu';

const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  clay: { label: 'Clay', icon: '🧱' },
  n8n: { label: 'n8n', icon: '⚡' },
  lovable: { label: 'Lovable', icon: '💜' },
  cursor: { label: 'Cursor', icon: '▶️' },
  replit: { label: 'Replit', icon: '💻' },
  vercel: { label: 'Vercel', icon: '▲' },
  bolt: { label: 'Bolt', icon: '⚡' },
  v0: { label: 'v0', icon: '🎨' },
};

export default function PlatformLinks({ platformUrls }: { platformUrls: Record<string, string> | null }) {
  if (!platformUrls) return null;

  const entries = Object.entries(platformUrls).filter(([, url]) => url && url.trim().length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {entries.map(([key, url]) => {
        const meta = PLATFORM_META[key];
        if (!meta) return null;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs font-medium text-fg-secondary hover:border-brand/30 hover:text-brand transition-colors"
          >
            <span>{meta.icon}</span>
            {meta.label}
            <LuExternalLink size={10} className="text-fg-faint" />
          </a>
        );
      })}
    </div>
  );
}
