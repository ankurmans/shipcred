import posthog from 'posthog-js';

// ─── Centralized PostHog event tracking ───
// All event names in one place for consistency.

export const analytics = {
  // ═══ AUTH ═══
  loginStarted: (provider: 'github' | 'google' | 'linkedin_oidc') =>
    posthog.capture('login_started', { provider }),

  signupCompleted: (username: string) =>
    posthog.capture('signup_completed', { username }),

  signedOut: () =>
    posthog.capture('signed_out'),

  // ═══ LANDING PAGE ═══
  heroCTAClicked: (username: string) =>
    posthog.capture('hero_cta_clicked', { username_entered: username }),

  footerCTAClicked: (username: string) =>
    posthog.capture('footer_cta_clicked', { username_entered: username }),

  navClicked: (item: string, location: 'desktop' | 'mobile') =>
    posthog.capture('nav_clicked', { item, location }),

  footerLinkClicked: (link: string) =>
    posthog.capture('footer_link_clicked', { link }),

  // ═══ PROFILE ═══
  profileViewed: (username: string, isOwner: boolean) =>
    posthog.capture('profile_viewed', { username, is_owner: isOwner }),

  profileEdited: (fields: string[]) =>
    posthog.capture('profile_edited', { fields_updated: fields }),

  profileShared: (method: 'copy' | 'twitter' | 'linkedin', username: string) =>
    posthog.capture('profile_shared', { method, username }),

  visitorCTAClicked: () =>
    posthog.capture('visitor_cta_clicked'),

  visitorCTADismissed: () =>
    posthog.capture('visitor_cta_dismissed'),

  profileExternalLinkClicked: (platform: string, url: string) =>
    posthog.capture('profile_external_link_clicked', { platform, url }),

  compareProfileViewed: (user1: string, user2: string) =>
    posthog.capture('compare_profile_viewed', { user1, user2 }),

  // ═══ GITHUB ═══
  githubConnected: () =>
    posthog.capture('github_connected'),

  githubSyncStarted: () =>
    posthog.capture('github_sync_started'),

  githubSyncCompleted: (repos: number, aiCommits: number) =>
    posthog.capture('github_sync_completed', { repos_scanned: repos, ai_commits_found: aiCommits }),

  githubSyncFailed: (error: string) =>
    posthog.capture('github_sync_failed', { error }),

  // ═══ PORTFOLIO ═══
  portfolioItemAdded: (category: string, tools: string[]) =>
    posthog.capture('portfolio_item_added', { category, tools_used: tools }),

  // ═══ SHOWCASE ═══
  showcaseTabSwitched: (tab: string) =>
    posthog.capture('showcase_tab_switched', { tab }),

  videoProofAdded: (category: string) =>
    posthog.capture('video_proof_added', { category }),

  videoProofDeleted: () =>
    posthog.capture('video_proof_deleted'),

  contentProofAdded: (platform: string) =>
    posthog.capture('content_proof_added', { platform }),

  contentProofDeleted: () =>
    posthog.capture('content_proof_deleted'),

  certificationAdded: (name: string) =>
    posthog.capture('certification_added', { cert_name: name }),

  certificationDeleted: () =>
    posthog.capture('certification_deleted'),

  fileUploaded: (fileType: string, fileSize: number) =>
    posthog.capture('file_uploaded', { file_type: fileType, file_size_kb: Math.round(fileSize / 1024) }),

  fileDeleted: () =>
    posthog.capture('file_deleted'),

  // ═══ LEADERBOARD ═══
  leaderboardFiltered: (role: string) =>
    posthog.capture('leaderboard_filtered', { role }),

  leaderboardProfileClicked: (username: string, rank: number) =>
    posthog.capture('leaderboard_profile_clicked', { username, rank }),

  // ═══ EMBED & REFERRAL ═══
  embedCodeCopied: (format: 'md' | 'html') =>
    posthog.capture('embed_code_copied', { format }),

  referralLinkCopied: () =>
    posthog.capture('referral_link_copied'),

  // ═══ FEEDBACK ═══
  feedbackSubmitted: (category: string) =>
    posthog.capture('feedback_submitted', { category }),

  // ═══ FLAGGING ═══
  flagSubmitted: (flagType: string, reason: string) =>
    posthog.capture('flag_submitted', { flag_type: flagType, reason }),

  // ═══ DASHBOARD ═══
  nextActionClicked: (actionId: string, category: string, pointsPotential: number) =>
    posthog.capture('next_action_clicked', { action_id: actionId, category, points_potential: pointsPotential }),

  dashboardViewed: (score: number, tier: string) =>
    posthog.capture('dashboard_viewed', { score, tier }),

  // ═══ EXTERNAL LINKS ═══
  externalLinkClicked: (url: string, context: string) =>
    posthog.capture('external_link_clicked', { url, context }),

  // ═══ USER IDENTIFICATION ═══
  identify: (userId: string, properties?: Record<string, any>) =>
    posthog.identify(userId, properties),

  // Set user properties that persist across sessions
  setPersonProperties: (properties: Record<string, any>) =>
    posthog.people.set(properties),
};
