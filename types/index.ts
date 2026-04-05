// ============================================================
// CORE ENTITY TYPES
// ============================================================

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  role: ProfileRole | null;
  company: string | null;
  looking_for_work: boolean;
  github_username: string | null;
  github_connected_at: string | null;
  github_scopes: string[] | null;
  last_github_sync_at: string | null;
  shipcred_score: number;
  shipcred_tier: ShipCredTier;
  score_breakdown: ScoreBreakdown;
  is_featured: boolean;
  is_verified: boolean;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}

export type ProfileRole =
  | 'marketer'
  | 'sdr'
  | 'ae'
  | 'growth'
  | 'founder'
  | 'other';

export type ShipCredTier =
  | 'unranked'
  | 'shipper'
  | 'builder'
  | 'captain'
  | 'legend';

export interface ScoreBreakdown {
  github: number;
  portfolio: number;
  vouches: number;
  tools: number;
}

// ============================================================
// GITHUB COMMITS
// ============================================================

export interface GitHubCommit {
  id: string;
  profile_id: string;
  commit_sha: string;
  repo_full_name: string;
  repo_is_private: boolean;
  commit_message: string | null;
  committed_at: string;
  ai_tool_detected: AITool | null;
  ai_detection_method: AIDetectionMethod | null;
  ai_detection_confidence: number;
  additions: number;
  deletions: number;
  files_changed: number;
  synced_at: string;
}

export type AITool =
  | 'claude_code'
  | 'copilot'
  | 'cursor'
  | 'aider'
  | 'windsurf'
  | 'devin'
  | 'lovable';

export type AIDetectionMethod =
  | 'co_author_trailer'
  | 'bot_commit'
  | 'branch_name'
  | 'cursorrules';

// ============================================================
// PORTFOLIO ITEMS
// ============================================================

export interface PortfolioItem {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  url: string | null;
  screenshot_url: string | null;
  category: PortfolioCategory | null;
  tools_used: string[];
  verification_status: VerificationStatus;
  vouch_count: number;
  is_pinned: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type PortfolioCategory =
  | 'landing_page'
  | 'automation'
  | 'outbound_system'
  | 'analytics'
  | 'app'
  | 'other';

export type VerificationStatus =
  | 'self_reported'
  | 'vouched'
  | 'verified';

// ============================================================
// TOOL DECLARATIONS
// ============================================================

export interface ToolDeclaration {
  id: string;
  profile_id: string;
  tool_name: string;
  proficiency: ToolProficiency;
  is_verified: boolean;
  verified_commit_count: number;
  declared_at: string;
}

export type ToolProficiency =
  | 'beginner'
  | 'user'
  | 'power_user'
  | 'expert';

// ============================================================
// VOUCHES
// ============================================================

export interface Vouch {
  id: string;
  voucher_id: string;
  vouchee_id: string;
  portfolio_item_id: string | null;
  message: string | null;
  created_at: string;
}

// ============================================================
// GITHUB SYNC JOBS
// ============================================================

export interface GitHubSyncJob {
  id: string;
  profile_id: string;
  status: SyncJobStatus;
  repos_scanned: number;
  commits_analyzed: number;
  ai_commits_found: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export type SyncJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

// ============================================================
// EXTERNAL PROOFS
// ============================================================

export interface ExternalProof {
  id: string;
  profile_id: string;
  source_type: ProofSourceType;
  project_url: string;
  project_name: string | null;
  platform_data: Record<string, unknown>;
  verification_status: ProofVerificationStatus;
  verification_method: string | null;
  verified_at: string | null;
  screenshot_url: string | null;
  is_pinned: boolean;
  display_order: number;
  proof_score: number;
  created_at: string;
  updated_at: string;
}

export type ProofSourceType =
  | 'vercel'
  | 'lovable'
  | 'bolt'
  | 'v0'
  | 'replit'
  | 'railway'
  | 'netlify'
  | 'fly'
  | 'figma'
  | 'clay'
  | 'custom_url';

export type ProofVerificationStatus =
  | 'pending'
  | 'verified'
  | 'failed'
  | 'manual';

// ============================================================
// API RESPONSE HELPERS
// ============================================================

export interface PublicProfile extends Omit<Profile, 'user_id' | 'github_connected_at' | 'github_scopes' | 'last_github_sync_at'> {
  portfolio_items: PortfolioItem[];
  tool_declarations: ToolDeclaration[];
  vouches_received: Vouch[];
  external_proofs: ExternalProof[];
  github_stats: {
    total_commits: number;
    ai_commits: number;
    tools_detected: Record<string, number>;
    active_weeks: number;
  };
}

export interface LeaderboardEntry {
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: ProfileRole | null;
  company: string | null;
  shipcred_score: number;
  shipcred_tier: ShipCredTier;
  top_tools: string[];
}

// ============================================================
// GITHUB API TYPES (raw from GitHub)
// ============================================================

export interface GitHubAPICommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
    tree: {
      sha: string;
    };
  };
  committer: {
    login: string;
  } | null;
  stats?: {
    additions: number;
    deletions: number;
  };
  files?: { filename: string }[];
}

export interface GitHubAPIRepo {
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
  pushed_at: string;
}
