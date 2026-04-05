const AI_TOOL_KEYWORDS = [
  'claude', 'claude code', 'cursor', 'copilot', 'aider', 'windsurf',
  'lovable', 'bolt', 'v0', 'replit', 'devin', 'clay', 'mcp',
];

export interface ContentMetadata {
  platform: string;
  title: string | null;
  estimated_word_count: number | null;
  tools_mentioned: string[];
  url_verified: boolean;
}

export function detectContentPlatform(url: string): string {
  if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
  if (/linkedin\.com\/posts|linkedin\.com\/pulse/i.test(url)) return 'linkedin';
  if (/substack\.com/i.test(url)) return 'substack';
  if (/beehiiv\.com/i.test(url)) return 'beehiiv';
  if (/medium\.com/i.test(url)) return 'medium';
  if (/github\.com.*readme/i.test(url)) return 'github';
  return 'other';
}

function detectToolMentions(text: string): string[] {
  const lower = text.toLowerCase();
  return AI_TOOL_KEYWORDS.filter(keyword => lower.includes(keyword));
}

function estimateWordCount(html: string): number {
  // Strip tags, then count words
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(w => w.length > 0).length;
}

export async function validateContentProof(url: string): Promise<ContentMetadata | null> {
  const platform = detectContentPlatform(url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'GTM Commit/1.0 (proof-verification)' },
    });

    if (!res.ok) {
      return { platform, title: null, estimated_word_count: null, tools_mentioned: [], url_verified: false };
    }

    const html = await res.text();

    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/&#[0-9]+;/g, '').trim() || null;

    // Estimate word count from body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const wordCount = bodyMatch ? estimateWordCount(bodyMatch[1]) : null;

    // Detect tool mentions from title + first chunk of content
    const searchText = (title || '') + ' ' + html.slice(0, 5000);
    const tools = detectToolMentions(searchText);

    return {
      platform,
      title,
      estimated_word_count: wordCount,
      tools_mentioned: tools,
      url_verified: true,
    };
  } catch {
    return { platform, title: null, estimated_word_count: null, tools_mentioned: [], url_verified: false };
  }
}
