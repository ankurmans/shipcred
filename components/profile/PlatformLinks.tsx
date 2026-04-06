import {
  LuExternalLink, LuBox, LuZap, LuHeart, LuPlay,
  LuMonitor, LuTriangle, LuBolt, LuPalette, LuLink,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';

const PLATFORM_META: Record<string, { label: string; Icon: IconType }> = {
  clay: { label: 'Clay', Icon: LuBox },
  n8n: { label: 'n8n', Icon: LuZap },
  lovable: { label: 'Lovable', Icon: LuHeart },
  cursor: { label: 'Cursor', Icon: LuPlay },
  replit: { label: 'Replit', Icon: LuMonitor },
  vercel: { label: 'Vercel', Icon: LuTriangle },
  bolt: { label: 'Bolt', Icon: LuBolt },
  v0: { label: 'v0', Icon: LuPalette },
};

export default function PlatformLinks({ platformUrls }: { platformUrls: Record<string, string> | null }) {
  if (!platformUrls) return null;

  const entries = Object.entries(platformUrls).filter(([, url]) => url && url.trim().length > 0);
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map(([key, url]) => {
        const meta = PLATFORM_META[key];
        const Icon = meta?.Icon || LuLink;
        const label = meta?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs font-medium text-fg-secondary hover:border-brand/30 hover:text-brand transition-colors"
          >
            <Icon size={12} />
            {label}
            <LuExternalLink size={10} className="text-fg-faint" />
          </a>
        );
      })}
    </>
  );
}
