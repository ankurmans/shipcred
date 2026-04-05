const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const SCOPES = ['repo', 'read:user'];

export function getGitHubAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    scope: SCOPES.join(' '),
    state,
  });
  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

export async function getGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch GitHub user');
  return response.json() as Promise<{
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    blog: string | null;
    twitter_username: string | null;
    company: string | null;
  }>;
}
