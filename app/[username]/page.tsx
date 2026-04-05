import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import Avatar from '@/components/shared/Avatar';
import ScoreCard from '@/components/profile/ScoreCard';
import GitHubStats from '@/components/profile/GitHubStats';
import PortfolioGrid from '@/components/profile/PortfolioGrid';
import VideoProofs from '@/components/profile/VideoProofs';
import ContentProofs from '@/components/profile/ContentProofs';
import CertificationsDisplay from '@/components/profile/Certifications';
import VouchSection from '@/components/profile/VouchSection';
import PoweredByBadge from '@/components/profile/PoweredByBadge';
import ShareButton from '@/components/shared/ShareButton';
import VisitorCTA from '@/components/profile/VisitorCTA';
import ProfileViewTracker from '@/components/profile/ProfileViewTracker';
import PlatformLinks from '@/components/profile/PlatformLinks';
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

  // Check auth via cookie presence (no network call — fast)
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.getAll().some(c => c.name.includes('auth-token'));

  // Tier-based page gradient
  const tierGradient: Record<string, string> = {
    legend: 'from-amber-50 via-amber-50/50 to-transparent',
    captain: 'from-indigo-50 via-indigo-50/40 to-transparent',
    builder: 'from-orange-50 via-orange-50/40 to-transparent',
    shipper: 'from-stone-50 via-stone-50/30 to-transparent',
    unranked: 'from-gray-50/50 to-transparent',
  };
  const gradient = tierGradient[profile.gtmcommit_tier] || tierGradient.unranked;

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        {/* Tier-based background gradient — fades to white */}
        <div className={`absolute inset-x-0 top-0 h-80 bg-gradient-to-b ${gradient} pointer-events-none`} aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Profile header — always inline */}
          <div className="flex items-start gap-4 sm:gap-6">
            <Avatar src={profile.avatar_url} alt={profile.display_name} size="xl" isVerified={profile.is_verified} />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{profile.display_name}</h1>
              <p className="text-fg-muted text-sm mt-0.5 truncate">@{profile.username}{profile.role && ` · ${profile.role}`}{profile.company && ` @ ${profile.company}`}</p>
              {/* Gamification badges */}
              {(profile.current_streak > 0) && (
                <div className="flex items-center gap-2 mt-1.5">
                  {profile.current_streak > 0 && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      profile.current_streak >= 4 ? 'gradient-brand text-white' : 'bg-surface-muted text-fg-secondary'
                    }`}>
                      🔥 {profile.current_streak}w streak
                    </span>
                  )}
                </div>
              )}
              {profile.bio && <p className="mt-2 text-sm hidden sm:block">{profile.bio}</p>}
              <div className="hidden sm:flex gap-3 mt-2">
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">Website</a>}
                {profile.twitter_handle && <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">@{profile.twitter_handle}</a>}
              </div>
            </div>
          </div>

          {/* Mobile-only: bio & links below header */}
          {profile.bio && <p className="mt-2 text-sm sm:hidden">{profile.bio}</p>}
          {(profile.website_url || profile.twitter_handle) && (
            <div className="flex gap-3 mt-1.5 sm:hidden">
              {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">Website</a>}
              {profile.twitter_handle && <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-dark">@{profile.twitter_handle}</a>}
            </div>
          )}

          {/* Platform links */}
          <PlatformLinks platformUrls={profile.platform_urls} />

          {/* Score Card — the hero screenshot unit */}
          <div className="mt-5 sm:mt-6">
            <ScoreCard profile={profile} tools={tools} appUrl={appUrl} showHeader={false} />
          </div>

          {/* Share & compare — below the wow moment */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <ShareButton url={`${appUrl}/${profile.username}`} title={`${profile.display_name}'s GTM Commit — Score: ${profile.gtmcommit_score}`} score={profile.gtmcommit_score} tier={profile.gtmcommit_tier} />
            <a href={`/compare/${profile.username}/`} className="btn-ghost btn-sm text-xs">Compare with me</a>
          </div>
          {githubStats.totalCommits > 0 && <div className="mt-6 sm:mt-8"><GitHubStats {...githubStats} /></div>}
          {portfolioItems.length > 0 && <div className="mt-6 sm:mt-8"><PortfolioGrid items={portfolioItems} /></div>}
          {videoProofs.length > 0 && <div className="mt-6 sm:mt-8"><VideoProofs videos={videoProofs} /></div>}
          {contentProofs.length > 0 && <div className="mt-6 sm:mt-8"><ContentProofs content={contentProofs} /></div>}
          {certifications.length > 0 && <div className="mt-6 sm:mt-8"><CertificationsDisplay certifications={certifications} /></div>}
          {vouches.length > 0 && <div className="mt-6 sm:mt-8"><VouchSection vouches={vouches} /></div>}
          <div className="mt-6 sm:mt-8"><PoweredByBadge /></div>
        </div>
      </main>
      <Footer />
      {!isAuthenticated && <VisitorCTA />}
      <ProfileViewTracker profileId={profile.id} />
    </>
  );
}
