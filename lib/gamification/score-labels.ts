import type { ScoreBreakdown } from '@/types';

export interface ScoreDetailMeta {
  label: string;
  maxValue: number;
  tier: 1 | 2 | 3;
  boostHref: string;
  boostLabel: string;
}

export const SCORE_DETAIL_META: Record<keyof ScoreBreakdown['detail'], ScoreDetailMeta> = {
  githubCommits: { label: 'GitHub AI Commits', maxValue: 350, tier: 1, boostHref: '/profile/connect', boostLabel: 'Sync GitHub' },
  commitImpact: { label: 'Code Impact', maxValue: 60, tier: 1, boostHref: '/profile/connect', boostLabel: 'Ship more code' },
  privateRepoBonus: { label: 'Private Repo Work', maxValue: 40, tier: 1, boostHref: '/profile/connect', boostLabel: 'Use AI at work' },
  platformDeploys: { label: 'Platform Deployments', maxValue: 150, tier: 1, boostHref: '/showcase', boostLabel: 'Add deployment' },
  certsTier1: { label: 'Verified Certifications', maxValue: 80, tier: 1, boostHref: '/showcase', boostLabel: 'Add certification' },
  toolDiversity: { label: 'Tool Diversity', maxValue: 80, tier: 1, boostHref: '/showcase', boostLabel: 'Use more tools' },
  consistency: { label: 'Consistency', maxValue: 50, tier: 1, boostHref: '/dashboard', boostLabel: 'Keep shipping monthly' },
  streak: { label: 'Shipping Streak', maxValue: 50, tier: 1, boostHref: '/dashboard', boostLabel: 'Maintain your streak' },
  vouchedPortfolio: { label: 'Vouched Portfolio', maxValue: 100, tier: 2, boostHref: '/portfolio', boostLabel: 'Get vouches' },
  vouchedUploads: { label: 'Vouched Uploads', maxValue: 40, tier: 2, boostHref: '/showcase', boostLabel: 'Upload & get vouched' },
  vouchedVideos: { label: 'Vouched Videos', maxValue: 50, tier: 2, boostHref: '/showcase', boostLabel: 'Add video proof' },
  vouchedContent: { label: 'Vouched Content', maxValue: 40, tier: 2, boostHref: '/showcase', boostLabel: 'Publish content' },
  certsTier2: { label: 'Vouch-Verified Certs', maxValue: 30, tier: 2, boostHref: '/showcase', boostLabel: 'Get cert vouched' },
  unvouchedPortfolio: { label: 'Portfolio Items', maxValue: 30, tier: 3, boostHref: '/portfolio', boostLabel: 'Add project' },
  unvouchedUploads: { label: 'Uploaded Files', maxValue: 25, tier: 3, boostHref: '/showcase', boostLabel: 'Upload files' },
  unvouchedVideos: { label: 'Video Proofs', maxValue: 20, tier: 3, boostHref: '/showcase', boostLabel: 'Add video' },
  unvouchedContent: { label: 'Published Content', maxValue: 15, tier: 3, boostHref: '/showcase', boostLabel: 'Add content' },
  unrecognizedCerts: { label: 'Pending Certs', maxValue: 10, tier: 3, boostHref: '/showcase', boostLabel: 'Add certification' },
  toolDeclarations: { label: 'Tool Declarations', maxValue: 15, tier: 3, boostHref: '/profile/edit', boostLabel: 'Declare tools' },
  profileCompleteness: { label: 'Profile Completeness', maxValue: 15, tier: 3, boostHref: '/profile/edit', boostLabel: 'Complete profile' },
};

export const TIER_LABELS = {
  1: { label: 'Auto-Verified', color: 'text-green-600', bg: 'bg-green-500' },
  2: { label: 'Community Verified', color: 'text-blue-600', bg: 'bg-blue-500' },
  3: { label: 'Self-Reported', color: 'text-amber-600', bg: 'bg-amber-500' },
} as const;
