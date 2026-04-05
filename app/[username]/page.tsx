import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Avatar from '@/components/shared/Avatar';
import ShipCredScore from '@/components/profile/ShipCredScore';
import ToolBadges from '@/components/profile/ToolBadges';
import GitHubStats from '@/components/profile/GitHubStats';
import PortfolioGrid from '@/components/profile/PortfolioGrid';
import VouchSection from '@/components/profile/VouchSection';
import PoweredByBadge from '@/components/profile/PoweredByBadge';
import ShareButton from '@/components/shared/ShareButton';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getProfileData(username: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) return null;

  const [portfolioRes, toolsRes, vouchesRes, commitsRes, proofsRes] = await Promise.all([
    supabase.from('portfolio_items').select('*').eq('profile_id', profile.id).order('display_order'),
    supabase.from('tool_declarations').select('*').eq('profile_id', profile.id),
    supabase.from('vouches').select('*, voucher:voucher_id(username, display_name, avatar_url)').eq('vouchee_id', profile.id),
    supabase.from('github_commits').select('ai_tool_detected, committed_at').eq('profile_id', profile.id),
    supabase.from('external_proofs').select('*').eq('profile_id', profile.id).eq('verification_status', 'verified'),
  ]);

  // Calculate GitHub stats
  const commits = commitsRes.data || [];
  const aiCommits = commits.filter(c => c.ai_tool_detected);
  const toolsDetected: Record<string, number> = {};
  for (const c of aiCommits) {
    if (c.ai_tool_detected) {
      toolsDetected[c.ai_tool_detected] = (toolsDetected[c.ai_tool_detected] || 0) + 1;
    }
  }
  const activeWeeks = new Set(
    commits.map(c => {
      const d = new Date(c.committed_at);
      return `${d.getFullYear()}-${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)}`;
    })
  ).size;

  return {
    profile,
    portfolioItems: portfolioRes.data || [],
    tools: toolsRes.data || [],
    vouches: vouchesRes.data || [],
    externalProofs: proofsRes.data || [],
    githubStats: {
      totalCommits: commits.length,
      aiCommits: aiCommits.length,
      toolsDetected,
      activeWeeks,
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) return { title: 'Profile Not Found' };

  const { profile } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${profile.display_name} — ShipCred`,
    description: `${profile.display_name}'s ShipCred Score: ${profile.shipcred_score}. ${profile.bio || 'AI-native builder.'}`,
    openGraph: {
      title: `${profile.display_name} — ShipCred Score: ${profile.shipcred_score}`,
      description: profile.bio || 'Talk is cheap. Commits aren\'t.',
      images: [`${appUrl}/api/og/${username}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.display_name} — ShipCred Score: ${profile.shipcred_score}`,
      images: [`${appUrl}/api/og/${username}`],
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) notFound();

  const { profile, portfolioItems, tools, vouches, githubStats } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name}
              size="xl"
              isVerified={profile.is_verified}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-[family-name:var(--font-dm-sans)]">
                {profile.display_name}
              </h1>
              <p className="text-base-content/60 mt-1">
                @{profile.username}
                {profile.role && ` · ${profile.role}`}
                {profile.company && ` @ ${profile.company}`}
              </p>
              {profile.bio && (
                <p className="mt-3 text-sm">{profile.bio}</p>
              )}
              <div className="flex gap-3 mt-3">
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm">
                    Website
                  </a>
                )}
                {profile.twitter_handle && (
                  <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm">
                    @{profile.twitter_handle}
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm">
                    LinkedIn
                  </a>
                )}
              </div>
              <div className="mt-3">
                <ShareButton url={`${appUrl}/${profile.username}`} title={`Check out ${profile.display_name}'s ShipCred — Score: ${profile.shipcred_score}`} />
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="mt-8">
            <ShipCredScore
              score={profile.shipcred_score}
              tier={profile.shipcred_tier}
              breakdown={profile.score_breakdown}
              size="lg"
            />
          </div>

          {/* Tool Badges */}
          {tools.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Tools</h3>
              <ToolBadges tools={tools} />
            </div>
          )}

          {/* GitHub Stats */}
          {githubStats.totalCommits > 0 && (
            <div className="mt-8">
              <GitHubStats {...githubStats} />
            </div>
          )}

          {/* Portfolio */}
          {portfolioItems.length > 0 && (
            <div className="mt-8">
              <PortfolioGrid items={portfolioItems} />
            </div>
          )}

          {/* Vouches */}
          {vouches.length > 0 && (
            <div className="mt-8">
              <VouchSection vouches={vouches} />
            </div>
          )}

          {/* Powered By */}
          <div className="mt-8">
            <PoweredByBadge />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
