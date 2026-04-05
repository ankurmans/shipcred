import { NextResponse } from 'next/server';
import { getGitHubAuthURL } from '@/lib/github/oauth';

export async function GET() {
  const state = crypto.randomUUID();
  const url = getGitHubAuthURL(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return response;
}
