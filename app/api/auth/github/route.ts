import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAuthURL } from '@/lib/github/oauth';

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const url = getGitHubAuthURL(state);

  // Pass through desired username if provided
  const desiredUsername = request.nextUrl.searchParams.get('username');

  const response = NextResponse.redirect(url);
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  if (desiredUsername) {
    response.cookies.set('desired_username', desiredUsername, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
  }

  return response;
}
