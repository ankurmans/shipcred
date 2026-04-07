import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const TOOLS = ['claude_code', 'copilot', 'cursor', 'aider', 'windsurf', 'devin', 'lovable'];
const ROLES = ['marketer', 'sdr', 'ae', 'growth', 'founder', 'gtm-engineer'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';
  const supabase = createAdminClient();

  // Fetch all public profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .gt('gtmcommit_score', 0)
    .order('gtmcommit_score', { ascending: false });

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/stats`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/scoring`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const profilePages: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `${baseUrl}/${p.username}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const rolePages: MetadataRoute.Sitemap = ROLES.map((role) => ({
    url: `${baseUrl}/roles/${role}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...profilePages, ...toolPages, ...rolePages];
}
