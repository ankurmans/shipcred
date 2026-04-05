import type { GitHubAPICommit, GitHubAPIRepo, SpoofingSignal } from '@/types';

// ============================================================
// 1. Fork Detection
// ============================================================

export function isForkedRepo(repo: GitHubAPIRepo): boolean {
  return repo.fork === true;
}

export function filterForkedRepoCommits(
  commits: GitHubAPICommit[],
  repo: GitHubAPIRepo,
  userEmails: string[]
): GitHubAPICommit[] {
  if (!repo.fork) return commits;

  // Only count commits authored by this user AFTER the fork date
  const forkDate = repo.created_at ? new Date(repo.created_at) : new Date(0);
  return commits.filter(c => {
    const authorEmail = c.commit.author?.name || '';
    const authorDate = new Date(c.commit.author.date);
    return authorDate > forkDate && userEmails.some(e => authorEmail.includes(e));
  });
}

// ============================================================
// 2. Clone and Re-push Detection
// ============================================================

export function validateCommitAuthorship(
  commits: GitHubAPICommit[],
  userEmails: string[]
): GitHubAPICommit[] {
  return commits.filter(c => {
    const authorName = c.commit.author?.name || '';
    // Accept if author name matches any known email/username
    return userEmails.some(e => authorName.includes(e) || e.includes(authorName));
  });
}

export function detectSuspiciousHistory(
  commits: GitHubAPICommit[],
  repoCreatedAt: string
): boolean {
  if (commits.length < 5) return false;
  const repoDate = new Date(repoCreatedAt);
  const prePushCommits = commits.filter(c =>
    new Date(c.commit.author.date) < repoDate
  );
  return prePushCommits.length / commits.length > 0.8;
}

// ============================================================
// 3. Commit Message Spoofing Detection
// ============================================================

function groupByDay(commits: GitHubAPICommit[]): Record<string, GitHubAPICommit[]> {
  const groups: Record<string, GitHubAPICommit[]> = {};
  for (const c of commits) {
    const day = c.commit.author.date.split('T')[0];
    if (!groups[day]) groups[day] = [];
    groups[day].push(c);
  }
  return groups;
}

export function detectCommitSpoofing(commits: GitHubAPICommit[], aiCommitCount: number): SpoofingSignal {
  const aiCommits = commits.slice(0, aiCommitCount);

  // Signal 1: All AI commits use identical message patterns
  const messageTemplates = new Set(
    aiCommits.map(c =>
      c.commit.message.replace(/[a-f0-9]{7,}/g, '[hash]').replace(/\d+/g, '[num]')
    )
  );
  const lowVariety = aiCommits.length > 10 && messageTemplates.size < aiCommits.length * 0.3;

  // Signal 2: Burst pattern — >20 AI commits in a single day
  const commitsByDay = groupByDay(aiCommits);
  const hasBurst = Object.values(commitsByDay).some(dayCommits => dayCommits.length > 20);

  // Signal 3: Only one AI tool detected across ALL commits + high volume
  const tools = new Set(aiCommits.map(c => c.commit.message).filter(Boolean));
  const singleToolHighVolume = tools.size <= 1 && aiCommits.length > 50;

  // Signal 4: AI commits but zero non-AI commits in same repo (real usage has both)
  const totalCommits = commits.length;
  const aiRatio = aiCommitCount / totalCommits;
  const unrealisticRatio = aiRatio > 0.95 && aiCommitCount > 20;

  return {
    isSuspicious: lowVariety || hasBurst || singleToolHighVolume || unrealisticRatio,
    signals: { lowVariety, hasBurst, singleToolHighVolume, unrealisticRatio },
  };
}

// ============================================================
// 4. Empty / Trivial Commit Filter
// ============================================================

export function isSubstantiveCommit(commit: GitHubAPICommit): boolean {
  const totalChanges = (commit.stats?.additions || 0) + (commit.stats?.deletions || 0);
  if (totalChanges < 5) return false;

  // If only non-code files changed, require more lines
  const codeFiles = commit.files?.filter(f =>
    !f.filename.match(/\.(md|txt|json|yml|yaml|lock|env|gitignore)$/i)
  );
  if (codeFiles && codeFiles.length === 0 && totalChanges < 20) return false;

  return true;
}

// ============================================================
// 5. Empty Agent Repo Filter
// ============================================================

export function isSubstantiveAgentRepo(repo: GitHubAPIRepo, fileCount: number, commitCount: number, hasReadme: boolean): boolean {
  if ((repo.size || 0) < 10) return false;
  if (fileCount < 3) return false;
  if (commitCount < 2) return false;
  if (!hasReadme) return false;
  return true;
}

// ============================================================
// Combined Pipeline Filter
// ============================================================

export interface AntiGamingResult {
  filteredCommits: GitHubAPICommit[];
  spoofingSignal: SpoofingSignal | null;
  excludedCount: number;
  reasons: string[];
}

export function applyGitHubAntiGaming(
  commits: GitHubAPICommit[],
  repo: GitHubAPIRepo,
  userEmails: string[],
  aiDetectedCount: number
): AntiGamingResult {
  const reasons: string[] = [];
  let filtered = commits;

  // Step 1: Fork filtering
  if (isForkedRepo(repo)) {
    const before = filtered.length;
    filtered = filterForkedRepoCommits(filtered, repo, userEmails);
    if (filtered.length < before) {
      reasons.push(`Excluded ${before - filtered.length} pre-fork commits`);
    }
  }

  // Step 2: Author validation
  if (userEmails.length > 0) {
    const before = filtered.length;
    filtered = validateCommitAuthorship(filtered, userEmails);
    if (filtered.length < before) {
      reasons.push(`Excluded ${before - filtered.length} commits by other authors`);
    }
  }

  // Step 3: Suspicious history check
  if (repo.created_at && detectSuspiciousHistory(filtered, repo.created_at)) {
    reasons.push('Flagged: >80% of commits predate repo creation');
  }

  // Step 4: Substantive commit filter
  const beforeSubstantive = filtered.length;
  filtered = filtered.filter(isSubstantiveCommit);
  if (filtered.length < beforeSubstantive) {
    reasons.push(`Excluded ${beforeSubstantive - filtered.length} trivial commits`);
  }

  // Step 5: Spoofing detection
  const spoofingSignal = aiDetectedCount > 10
    ? detectCommitSpoofing(filtered, aiDetectedCount)
    : null;

  if (spoofingSignal?.isSuspicious) {
    reasons.push('Flagged: suspicious AI commit patterns detected');
  }

  return {
    filteredCommits: filtered,
    spoofingSignal,
    excludedCount: commits.length - filtered.length,
    reasons,
  };
}
