import type { ScoreBreakdown } from '@/types';
import { CERT_POINTS } from '@/lib/proofs/certification';

// ============================================================
// Input data shapes
// ============================================================

export interface ProfileData {
  commits: {
    ai_tool_detected: string | null;
    committed_at: string;
    repo_full_name?: string;
    additions?: number;
    deletions?: number;
    repo_is_private?: boolean;
  }[];
  portfolioItems: { vouch_count: number }[];
  vouchCount: number;
  toolDeclarations: { is_verified: boolean; tool_name?: string }[];
  externalProofs: { verification_status: string; source_type: string }[];
  videoProofs: { url_verified: boolean; duration_seconds: number | null; category: string | null; vouch_count: number }[];
  contentProofs: { url_verified: boolean; platform: string; vouch_count: number }[];
  certifications: { verification_status: string; issuer: string; vouch_count: number }[];
  uploadedFiles: { is_parsed_valid: boolean; vouch_count: number; file_type: string }[];
  streak?: { current: number; longest: number };
  // Profile fields for completeness scoring
  profile?: {
    bio: string | null;
    avatar_url: string | null;
    display_name: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    twitter_handle: string | null;
    role: string | null;
  };
}

// ============================================================
// Helper: count distinct active months
// ============================================================

function countActiveMonths(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const months = new Set(dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));
  return months.size;
}

// ============================================================
// TIER 1 — Auto-Verified (cap 700)
// ============================================================

function scoreGitHubCommits(commits: ProfileData['commits']): number {
  const aiCommits = commits.filter(c => c.ai_tool_detected);
  const totalCommits = aiCommits.length;
  if (totalCommits === 0) return 0;

  const uniqueRepos = new Set(aiCommits.map(c => c.repo_full_name).filter(Boolean)).size;
  const tools = new Set(aiCommits.map(c => c.ai_tool_detected));

  // Volume: flatter curve — 712 commits scores meaningfully more than 50
  // log2(51) = 5.7 → 171, log2(713) = 9.5 → 285 (capped at 150)
  const volumeScore = Math.min(150, Math.round(30 * Math.log2(totalCommits + 1)));

  // Repo diversity: more repos = more genuine usage — max 60
  const diversityScore = Math.min(60, uniqueRepos * 10);

  // Tool diversity within commits — max 40
  const toolScore = Math.min(40, Math.max(0, (tools.size - 1) * 20));

  // Recency: commits in last 30 days — max 40
  const recentCommits = aiCommits.filter(c =>
    Date.now() - new Date(c.committed_at).getTime() < 30 * 86400 * 1000
  ).length;
  const recencyScore = Math.min(40, recentCommits * 3);

  // Velocity bonus: 100+ AI commits in last 30 days = prolific — max 30
  const velocityBonus = recentCommits >= 100 ? 30 : recentCommits >= 50 ? 20 : recentCommits >= 20 ? 10 : 0;

  return Math.min(350, volumeScore + diversityScore + toolScore + recencyScore + velocityBonus);
}

function scoreCommitImpact(commits: ProfileData['commits']): number {
  const aiCommits = commits.filter(c => c.ai_tool_detected);
  if (aiCommits.length === 0) return 0;

  // Total lines changed across AI commits
  const totalLines = aiCommits.reduce((sum, c) => sum + (c.additions || 0) + (c.deletions || 0), 0);

  // Logarithmic: 10K+ lines is substantial, 100K+ is extraordinary
  // log2(10001) = 13.3 → 40, log2(100001) = 16.6 → 50
  return Math.min(60, Math.round(3 * Math.log2(totalLines + 1)));
}

function scorePrivateRepos(commits: ProfileData['commits']): number {
  const aiCommits = commits.filter(c => c.ai_tool_detected);
  if (aiCommits.length === 0) return 0;

  const privateCommits = aiCommits.filter(c => c.repo_is_private).length;
  const privateRatio = privateCommits / aiCommits.length;

  // Working on private repos = real company work, not just toy projects
  // 50%+ private = max bonus
  if (privateRatio >= 0.5) return 40;
  if (privateRatio >= 0.3) return 30;
  if (privateRatio >= 0.1) return 20;
  if (privateCommits > 0) return 10;
  return 0;
}

function scorePlatformDeployments(proofs: ProfileData['externalProofs']): number {
  const verified = proofs.filter(p => p.verification_status === 'verified');
  if (verified.length === 0) return 0;

  const platforms = new Set(verified.map(p => p.source_type));

  // 30 pts per verified deployment, max 120
  const deployScore = Math.min(120, verified.length * 30);

  // Platform diversity bonus: 3+ platforms = 30, 2 = 15
  const diversityBonus = platforms.size >= 3 ? 30 : platforms.size >= 2 ? 15 : 0;

  return Math.min(150, deployScore + diversityBonus);
}

function scoreCertsTier1(certs: ProfileData['certifications']): number {
  const autoVerified = certs.filter(c => c.verification_status === 'auto_verified');
  if (autoVerified.length === 0) return 0;

  // Deduplicate by issuer — only best per issuer
  const byIssuer = new Map<string, number>();
  for (const cert of autoVerified) {
    const pts = CERT_POINTS[cert.issuer] || 10;
    const existing = byIssuer.get(cert.issuer) || 0;
    if (pts > existing) byIssuer.set(cert.issuer, pts);
  }
  let total = 0;
  for (const pts of byIssuer.values()) total += pts;
  return Math.min(80, total);
}

function scoreToolDiversity(data: ProfileData): number {
  const tools = new Set<string>();

  // From GitHub commits
  data.commits.filter(c => c.ai_tool_detected).forEach(c => tools.add(c.ai_tool_detected!));

  // From platform deployments (each platform type counts)
  data.externalProofs.filter(p => p.verification_status === 'verified').forEach(p => tools.add(p.source_type));

  // From verified tool declarations
  data.toolDeclarations.filter(t => t.is_verified && t.tool_name).forEach(t => tools.add(t.tool_name!));

  // From uploaded artifacts
  if (data.uploadedFiles.some(f => f.file_type === 'claude_md')) tools.add('claude_code');
  if (data.uploadedFiles.some(f => f.file_type === 'cursorrules')) tools.add('cursor');
  if (data.uploadedFiles.some(f => f.file_type === 'mcp_config')) tools.add('mcp');

  if (tools.size >= 7) return 80;
  if (tools.size >= 5) return 60;
  if (tools.size >= 3) return 40;
  if (tools.size >= 2) return 20;
  return 0;
}

function scoreConsistency(data: ProfileData): number {
  const dates: Date[] = [
    ...data.commits.map(c => new Date(c.committed_at)),
    ...data.videoProofs.filter(v => v.url_verified).map(() => new Date()),
    ...data.contentProofs.filter(c => c.url_verified).map(() => new Date()),
    ...data.certifications.map(() => new Date()),
  ];

  const months = countActiveMonths(dates);
  if (months >= 6) return 50;
  if (months >= 4) return 35;
  if (months >= 3) return 25;
  if (months >= 2) return 15;
  return 0;
}

function scoreStreak(streak: ProfileData['streak']): number {
  if (!streak) return 0;
  const current = streak.current;
  const longest = streak.longest;

  // Current streak: active shipping habit
  let score = 0;
  if (current >= 12) score += 40;
  else if (current >= 8) score += 30;
  else if (current >= 4) score += 20;
  else if (current >= 2) score += 10;

  // Longest streak bonus: proven track record
  if (longest >= 12) score += 20;
  else if (longest >= 8) score += 15;
  else if (longest >= 4) score += 10;

  return Math.min(50, score);
}

// ============================================================
// TIER 2 — Community/Third-Party Verified (cap 200)
// ============================================================

function scoreVouchedPortfolio(items: ProfileData['portfolioItems']): number {
  const vouched = items.filter(p => p.vouch_count >= 2);
  return Math.min(100, vouched.length * 25);
}

function scoreVouchedUploads(uploads: ProfileData['uploadedFiles']): number {
  const vouched = uploads.filter(u => u.is_parsed_valid && u.vouch_count >= 2);
  return Math.min(40, vouched.length * 15);
}

function scoreVouchedVideos(videos: ProfileData['videoProofs']): number {
  const vouched = videos.filter(v => v.url_verified && v.vouch_count >= 2);
  let total = 0;
  for (const v of vouched.slice(0, 5)) {
    const base = v.category === 'build_session' ? 35 : v.category === 'workflow_walkthrough' ? 30 : 20;
    const mult = (v.duration_seconds || 0) > 300 ? 1.2 : (v.duration_seconds || 0) > 120 ? 1.1 : 1.0;
    total += Math.round(base * mult);
  }
  return Math.min(50, total);
}

function scoreVouchedContent(content: ProfileData['contentProofs']): number {
  const PLATFORM_PTS: Record<string, number> = {
    blog: 30, substack: 25, beehiiv: 25, medium: 20, github: 25,
    twitter: 20, linkedin: 20, other: 15,
  };
  const vouched = content.filter(c => c.url_verified && c.vouch_count >= 2);
  let total = 0;
  for (const c of vouched.slice(0, 8)) {
    total += PLATFORM_PTS[c.platform] || 15;
  }
  return Math.min(40, total);
}

function scoreCertsTier2(certs: ProfileData['certifications']): number {
  const vouchVerified = certs.filter(c =>
    c.verification_status !== 'auto_verified' && c.vouch_count >= 2
  );
  let total = 0;
  for (const cert of vouchVerified) {
    total += CERT_POINTS[cert.issuer] || 10;
  }
  return Math.min(30, total);
}

// ============================================================
// TIER 3 — Self-Reported (cap 100)
// ============================================================

function scoreUnvouchedPortfolio(items: ProfileData['portfolioItems']): number {
  const unvouched = items.filter(p => p.vouch_count < 2);
  return Math.min(30, unvouched.length * 8);
}

function scoreUnvouchedUploads(uploads: ProfileData['uploadedFiles']): number {
  const unvouched = uploads.filter(u => u.is_parsed_valid && u.vouch_count < 2);
  return Math.min(25, unvouched.length * 10);
}

function scoreUnvouchedVideos(videos: ProfileData['videoProofs']): number {
  const unvouched = videos.filter(v => v.url_verified && v.vouch_count < 2);
  let total = 0;
  for (const v of unvouched.slice(0, 5)) {
    const base = v.category === 'build_session' ? 12 : v.category === 'workflow_walkthrough' ? 10 : 6;
    total += base;
  }
  return Math.min(20, total);
}

function scoreUnvouchedContent(content: ProfileData['contentProofs']): number {
  const PLATFORM_PTS: Record<string, number> = {
    blog: 12, substack: 10, beehiiv: 10, medium: 8, github: 10,
    twitter: 6, linkedin: 6, other: 5,
  };
  const unvouched = content.filter(c => c.url_verified && c.vouch_count < 2);
  let total = 0;
  for (const c of unvouched.slice(0, 8)) {
    total += PLATFORM_PTS[c.platform] || 5;
  }
  return Math.min(15, total);
}

function scoreUnrecognizedCerts(certs: ProfileData['certifications']): number {
  const pending = certs.filter(c => c.verification_status === 'pending' && c.vouch_count < 2);
  return Math.min(10, pending.length * 5);
}

function scoreToolDeclarations(declarations: ProfileData['toolDeclarations']): number {
  const verified = declarations.filter(t => t.is_verified);
  const declared = declarations.filter(t => !t.is_verified);
  return Math.min(15, verified.length * 5 + declared.length * 2);
}

function scoreProfileCompleteness(data: ProfileData): number {
  let score = 0;
  const p = data.profile;
  if (p) {
    if (p.bio && p.bio.length > 10) score += 3;
    if (p.avatar_url) score += 3;
    if (p.display_name) score += 2;
    if (p.role) score += 1;
    if (p.website_url || p.linkedin_url || p.twitter_handle) score += 2;
  }
  // Proof-based completeness
  if (data.commits.length > 0) score += 1;
  if (data.portfolioItems.length > 0) score += 1;
  if (data.toolDeclarations.length > 0) score += 1;
  return Math.min(15, score);
}

// ============================================================
// Master Calculator
// ============================================================

export function calculateGtmCommitScore(data: ProfileData): ScoreBreakdown {
  // === TIER 1: Auto-Verified (cap 700) ===
  const githubCommits = scoreGitHubCommits(data.commits);
  const commitImpactVal = scoreCommitImpact(data.commits);
  const privateRepoBonusVal = scorePrivateRepos(data.commits);
  const platformDeploys = scorePlatformDeployments(data.externalProofs);
  const certsTier1Val = scoreCertsTier1(data.certifications);
  const toolDiversityVal = scoreToolDiversity(data);
  const consistencyVal = scoreConsistency(data);
  const streakVal = scoreStreak(data.streak);

  const tier1 = Math.min(700,
    githubCommits + commitImpactVal + privateRepoBonusVal +
    platformDeploys + certsTier1Val + toolDiversityVal + consistencyVal + streakVal
  );

  // === TIER 2: Community Verified (cap 200) ===
  const vouchedPortfolioVal = scoreVouchedPortfolio(data.portfolioItems);
  const vouchedUploadsVal = scoreVouchedUploads(data.uploadedFiles);
  const vouchedVideosVal = scoreVouchedVideos(data.videoProofs);
  const vouchedContentVal = scoreVouchedContent(data.contentProofs);
  const certsTier2Val = scoreCertsTier2(data.certifications);

  const tier2 = Math.min(200,
    vouchedPortfolioVal + vouchedUploadsVal + vouchedVideosVal + vouchedContentVal + certsTier2Val
  );

  // === TIER 3: Self-Reported (cap 100) ===
  const unvouchedPortfolioVal = scoreUnvouchedPortfolio(data.portfolioItems);
  const unvouchedUploadsVal = scoreUnvouchedUploads(data.uploadedFiles);
  const unvouchedVideosVal = scoreUnvouchedVideos(data.videoProofs);
  const unvouchedContentVal = scoreUnvouchedContent(data.contentProofs);
  const unrecognizedCertsVal = scoreUnrecognizedCerts(data.certifications);
  const toolDeclsVal = scoreToolDeclarations(data.toolDeclarations);
  const profileCompleteVal = scoreProfileCompleteness(data);

  const tier3 = Math.min(100,
    unvouchedPortfolioVal + unvouchedUploadsVal + unvouchedVideosVal +
    unvouchedContentVal + unrecognizedCertsVal + toolDeclsVal + profileCompleteVal
  );

  const total = tier1 + tier2 + tier3;

  return {
    tier1,
    tier2,
    tier3,
    total,
    detail: {
      githubCommits,
      commitImpact: commitImpactVal,
      privateRepoBonus: privateRepoBonusVal,
      platformDeploys,
      certsTier1: certsTier1Val,
      toolDiversity: toolDiversityVal,
      consistency: consistencyVal,
      streak: streakVal,
      vouchedPortfolio: vouchedPortfolioVal,
      vouchedUploads: vouchedUploadsVal,
      vouchedVideos: vouchedVideosVal,
      vouchedContent: vouchedContentVal,
      certsTier2: certsTier2Val,
      unvouchedPortfolio: unvouchedPortfolioVal,
      unvouchedUploads: unvouchedUploadsVal,
      unvouchedVideos: unvouchedVideosVal,
      unvouchedContent: unvouchedContentVal,
      unrecognizedCerts: unrecognizedCertsVal,
      toolDeclarations: toolDeclsVal,
      profileCompleteness: profileCompleteVal,
    },
  };
}

export function scoreToTier(score: number): string {
  if (score >= 750) return 'legend';
  if (score >= 500) return 'captain';
  if (score >= 250) return 'builder';
  if (score >= 50) return 'shipper';
  return 'unranked';
}
