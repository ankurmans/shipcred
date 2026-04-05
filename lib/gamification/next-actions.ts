import type { ScoreBreakdown } from '@/types';

export interface NextAction {
  id: string;
  label: string;
  description: string;
  pointsPotential: number;
  href: string;
  category: 'setup' | 'proof' | 'social' | 'content';
}

interface ProfileContext {
  github_username: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
}

export function getNextActions(
  profile: ProfileContext,
  breakdown: ScoreBreakdown | null,
): NextAction[] {
  const detail = breakdown?.detail;
  const actions: (NextAction & { priority: number })[] = [];

  // No GitHub connected — highest priority
  if (!profile.github_username) {
    actions.push({
      id: 'connect_github',
      label: 'Connect GitHub',
      description: 'Auto-verify your AI commits for up to 200 pts',
      pointsPotential: 200,
      href: '/api/auth/github',
      category: 'setup',
      priority: 200,
    });
  } else if (detail && detail.githubCommits === 0) {
    actions.push({
      id: 'sync_github',
      label: 'Sync GitHub',
      description: 'Run a sync to detect your AI-assisted commits',
      pointsPotential: 200,
      href: '/dashboard',
      category: 'setup',
      priority: 180,
    });
  }

  // Profile completeness
  if (detail && detail.profileCompleteness < 17) {
    const missing: string[] = [];
    if (!profile.bio) missing.push('bio');
    if (!profile.avatar_url) missing.push('photo');
    if (!profile.role) missing.push('role');
    if (!profile.website_url && !profile.linkedin_url && !profile.twitter_handle) missing.push('links');

    if (missing.length > 0) {
      const pts = 20 - (detail.profileCompleteness || 0);
      actions.push({
        id: 'complete_profile',
        label: 'Complete Your Profile',
        description: `Add your ${missing.slice(0, 2).join(' & ')} to boost your score`,
        pointsPotential: pts,
        href: '/profile/edit',
        category: 'setup',
        priority: pts * 3, // high effort-adjusted priority for easy wins
      });
    }
  }

  // Video proofs
  if (detail && detail.unvouchedVideos === 0 && detail.vouchedVideos === 0) {
    actions.push({
      id: 'add_video',
      label: 'Add a Video Proof',
      description: 'Record a Loom walkthrough of your AI workflow',
      pointsPotential: 30,
      href: '/proofs',
      category: 'proof',
      priority: 45,
    });
  }

  // Content proofs
  if (detail && detail.unvouchedContent === 0 && detail.vouchedContent === 0) {
    actions.push({
      id: 'add_content',
      label: 'Publish Content',
      description: 'Add blog posts, tweets, or LinkedIn articles about your AI work',
      pointsPotential: 25,
      href: '/proofs',
      category: 'content',
      priority: 40,
    });
  }

  // Platform deployments
  if (detail && detail.platformDeploys === 0) {
    actions.push({
      id: 'add_deployment',
      label: 'Add a Deployment',
      description: 'Link a Vercel, Lovable, or Replit project you shipped',
      pointsPotential: 150,
      href: '/proofs',
      category: 'proof',
      priority: 100,
    });
  }

  // Portfolio items
  if (detail && detail.unvouchedPortfolio === 0 && detail.vouchedPortfolio === 0) {
    actions.push({
      id: 'add_portfolio',
      label: 'Add a Project',
      description: 'Showcase something you shipped with AI tools',
      pointsPotential: 50,
      href: '/portfolio/new',
      category: 'proof',
      priority: 60,
    });
  }

  // Tool diversity
  if (detail && detail.toolDiversity < 40) {
    actions.push({
      id: 'tool_diversity',
      label: 'Use More AI Tools',
      description: 'Commits from 3+ tools unlocks diversity bonus',
      pointsPotential: 80 - (detail.toolDiversity || 0),
      href: '/proofs',
      category: 'proof',
      priority: 30,
    });
  }

  // Certifications
  if (detail && detail.certsTier1 === 0 && detail.unrecognizedCerts === 0) {
    actions.push({
      id: 'add_cert',
      label: 'Add a Certification',
      description: 'Link AI tool certifications for auto-verification',
      pointsPotential: 80,
      href: '/proofs',
      category: 'proof',
      priority: 50,
    });
  }

  // Get vouched
  if (detail && detail.vouchedPortfolio === 0 && detail.unvouchedPortfolio > 0) {
    actions.push({
      id: 'get_vouched',
      label: 'Get Your Work Vouched',
      description: 'Share your profile — vouched items score 3x higher',
      pointsPotential: 120,
      href: '/portfolio',
      category: 'social',
      priority: 70,
    });
  }

  // Sort by priority descending, return top 3
  actions.sort((a, b) => b.priority - a.priority);
  return actions.slice(0, 3);
}
