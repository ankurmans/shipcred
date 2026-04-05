import type { GitHubAPICommit, GitHubAPIRepo } from '@/types';

const GITHUB_API = 'https://api.github.com';

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchAllRepos(token: string): Promise<GitHubAPIRepo[]> {
  const repos: GitHubAPIRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const batch = await githubFetch<GitHubAPIRepo[]>(
      `/user/repos?per_page=${perPage}&page=${page}&sort=pushed&affiliation=owner,collaborator`,
      token
    );
    repos.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchCommits(
  token: string,
  repoFullName: string,
  options: { since: string; author?: string }
): Promise<GitHubAPICommit[]> {
  const commits: GitHubAPICommit[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
      since: options.since,
    });
    if (options.author) params.set('author', options.author);

    try {
      const batch = await githubFetch<GitHubAPICommit[]>(
        `/repos/${repoFullName}/commits?${params.toString()}`,
        token
      );
      commits.push(...batch);
      if (batch.length < perPage) break;
      page++;
    } catch {
      // Repo might be empty or inaccessible
      break;
    }
  }

  return commits;
}

export async function fetchCommitDetail(
  token: string,
  repoFullName: string,
  sha: string
): Promise<GitHubAPICommit> {
  return githubFetch<GitHubAPICommit>(
    `/repos/${repoFullName}/commits/${sha}`,
    token
  );
}
