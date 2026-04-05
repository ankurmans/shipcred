const AI_TOOL_KEYWORDS = [
  'claude', 'claude code', 'cursor', 'copilot', 'aider', 'windsurf',
  'lovable', 'bolt', 'v0', 'replit', 'devin', 'clay', 'mcp',
];

export interface VideoMetadata {
  platform: 'loom' | 'youtube' | 'vimeo';
  title: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  tools_mentioned: string[];
  url_verified: boolean;
}

export function detectVideoPlatform(url: string): 'loom' | 'youtube' | 'vimeo' | null {
  if (/loom\.com\/share/i.test(url)) return 'loom';
  if (/youtube\.com\/watch|youtu\.be/i.test(url)) return 'youtube';
  if (/vimeo\.com\/\d+/i.test(url)) return 'vimeo';
  return null;
}

function getOEmbedUrl(platform: string, url: string): string {
  switch (platform) {
    case 'loom':
      return `https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`;
    case 'youtube':
      return `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    case 'vimeo':
      return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
    default:
      return '';
  }
}

function detectToolMentions(text: string): string[] {
  const lower = text.toLowerCase();
  return AI_TOOL_KEYWORDS.filter(keyword => lower.includes(keyword));
}

export async function validateVideoProof(url: string): Promise<VideoMetadata | null> {
  const platform = detectVideoPlatform(url);
  if (!platform) return null;

  const oembedUrl = getOEmbedUrl(platform, url);
  if (!oembedUrl) return null;

  try {
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return {
        platform,
        title: null,
        thumbnail_url: null,
        duration_seconds: null,
        tools_mentioned: [],
        url_verified: false,
      };
    }

    const data = await res.json();

    // Duration check: minimum 30 seconds
    const duration = data.duration || null;
    if (duration !== null && duration < 30) return null;

    const title = data.title || null;
    const tools = title ? detectToolMentions(title) : [];

    return {
      platform,
      title,
      thumbnail_url: data.thumbnail_url || null,
      duration_seconds: duration,
      tools_mentioned: tools,
      url_verified: true,
    };
  } catch {
    return {
      platform,
      title: null,
      thumbnail_url: null,
      duration_seconds: null,
      tools_mentioned: [],
      url_verified: false,
    };
  }
}
