import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Avatar from '@/components/shared/Avatar';
import GtmCommitScore from '@/components/profile/GtmCommitScore';
import ToolBadges from '@/components/profile/ToolBadges';
import GitHubStats from '@/components/profile/GitHubStats';
import PortfolioGrid from '@/components/profile/PortfolioGrid';
import VideoProofs from '@/components/profile/VideoProofs';
import ContentProofs from '@/components/profile/ContentProofs';
import CertificationsDisplay from '@/components/profile/Certifications';
import VouchSection from '@/components/profile/VouchSection';
import PoweredByBadge from '@/components/profile/PoweredByBadge';
import ShareButton from '@/components/shared/ShareButton';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';

interface PageProps { params: Promise<{ username: string }> }

async function getProfileData(username: string) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single();
  if (!profile) return null;

  const [portfolioRes, toolsRes, vouchesRes, commitsRes, videosRes, contentRes, certsRes] = await Promise.all([
    supabase.from('portfolio_items').select('*').eq('profile_id', profile.id).order('display_order'),
    supabase.from('tool_declarations').select('*').eq('profile_id', profile.id),
    supabase.from('vouches').select('*, voucher:voucher_id(username, display_name, avatar_url)').eq('vouchee_id', profile.id),
    supabase.from('github_commits').select('ai_tool_detected, committed_at').eq('profile_id', profile.id),
    supabase.from('video_proofs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('content_proofs').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('certifications').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
  ]);

  const commits = commitsRes.data || [];
  const aiCommits = commits.filter(c => c.ai_tool_detected);
  const toolsDetected: Record<string, number> = {};
  for (const c of aiCommits) { if (c.ai_tool_detected) toolsDetected[c.ai_tool_detected] = (toolsDetected[c.ai_tool_detected] || 0) + 1; }
  const activeWeeks = new Set(commits.map(c => { const d = new Date(c.committed_at); return `${d.getFullYear()}-${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)}`; })).size;

  return {
    profile,
    portfolioItems: portfolioRes.data || [],
    tools: toolsRes.data || [],
    vouches: vouchesRes.data || [],
    videoProofs: videosRes.data || [],
    contentProofs: contentRes.data || [],
    certifications: certsRes.data || [],
    githubStats: { totalCommits: commits.length, aiCommits: aiCommits.length, toolsDetected, activeWeeks },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) return { title: 'Not Found' };
  const { profile } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return {
    title: `${profile.display_name} — GTM Commit`,
    description: `${profile.display_name}'s GTM Commit Score: ${profile.gtmcommit_score}. ${profile.bio || 'AI-native builder.'}`,
    openGraph: { title: `${profile.display_name} — GTM Commit Score: ${profile.gtmcommit_score}`, images: [`${appUrl}/api/og/${username}`] },
    twitter: { card: 'summary_large_image', title: `${profile.display_name} — GTM Commit Score: ${profile.gtmcommit_score}`, images: [`${appUrl}/api/og/${username}`] },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) notFound();
  const { profile, portfolioItems, tools, vouches, videoProofs, contentProofs, certifications, githubStats } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar src={profile.avatar_url} alt={profile.display_name} size="xl" isVerified={profile.is_verified} />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold">{profile.display_name}</h1>
              <p className="text-fg-muted mt-1">@{profile.username}{profile.role && ` · ${profile.role}`}{profile.company && ` @ ${profile.company}`}</p>
              {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
              <div className="flex gap-3 mt-3">
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">Website</a>}
                {profile.twitter_handle && <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">@{profile.twitter_handle}</a>}
              </div>
              <div className="mt-3"><ShareButton url={`${appUrl}/${profile.username}`} title={`${profile.display_name}'s GTM Commit — Score: ${profile.gtmcommit_score}`} /></div>
            </div>
          </div>
          <div className="mt-8"><GtmCommitScore score={profile.gtmcommit_score} tier={profile.gtmcommit_tier} breakdown={profile.score_breakdown} size="lg" /></div>
          {tools.length > 0 && <div className="mt-8"><h3 className="font-display text-lg font-semibold mb-3">Tools</h3><ToolBadges tools={tools} /></div>}
          {githubStats.totalCommits > 0 && <div className="mt-8"><GitHubStats {...githubStats} /></div>}
          {portfolioItems.length > 0 && <div className="mt-8"><PortfolioGrid items={portfolioItems} /></div>}
          {videoProofs.length > 0 && <div className="mt-8"><VideoProofs videos={videoProofs} /></div>}
          {contentProofs.length > 0 && <div className="mt-8"><ContentProofs content={contentProofs} /></div>}
          {certifications.length > 0 && <div className="mt-8"><CertificationsDisplay certifications={certifications} /></div>}
          {vouches.length > 0 && <div className="mt-8"><VouchSection vouches={vouches} /></div>}
          <div className="mt-8"><PoweredByBadge /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
