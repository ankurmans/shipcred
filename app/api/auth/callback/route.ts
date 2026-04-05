import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCodeForToken, getGitHubUser } from '@/lib/github/oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('github_oauth_state')?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Validate state
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for GitHub access token
    const githubToken = await exchangeCodeForToken(code);
    const githubUser = await getGitHubUser(githubToken);

    // Sign in or create user via Supabase Admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if profile exists for this GitHub user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('github_username', githubUser.login)
      .single();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
      // Update GitHub token
      await supabase
        .from('profiles')
        .update({
          github_access_token: githubToken,
          github_connected_at: new Date().toISOString(),
          github_scopes: ['repo', 'read:user'],
          avatar_url: githubUser.avatar_url,
        })
        .eq('user_id', userId);
    } else {
      // Create Supabase auth user
      const email = `${githubUser.login}@github.gtmcommit.com`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { github_username: githubUser.login },
      });
      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create user');
      }
      userId = authData.user.id;

      // Use desired username from cookie if available, fallback to GitHub login
      const desiredUsername = request.cookies.get('desired_username')?.value;
      const finalUsername = (desiredUsername || githubUser.login).toLowerCase().replace(/[^a-z0-9_-]/g, '');

      // Create profile
      await supabase.from('profiles').insert({
        user_id: userId,
        username: finalUsername,
        display_name: githubUser.name || githubUser.login,
        bio: githubUser.bio,
        avatar_url: githubUser.avatar_url,
        website_url: githubUser.blog || null,
        twitter_handle: githubUser.twitter_username || null,
        company: githubUser.company || null,
        github_username: githubUser.login,
        github_access_token: githubToken,
        github_connected_at: new Date().toISOString(),
        github_scopes: ['repo', 'read:user'],
      });
    }

    // Generate a session link for the user
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${githubUser.login}@github.gtmcommit.com`,
      });

    if (linkError || !linkData) {
      throw new Error('Failed to generate session');
    }

    // Extract the token from the link
    const linkUrl = new URL(linkData.properties.action_link);
    const token_hash = linkUrl.searchParams.get('token') || linkUrl.hash;

    // Redirect to callback page which will set the session
    const redirectUrl = new URL('/callback', appUrl);
    redirectUrl.searchParams.set('token_hash', token_hash || '');
    redirectUrl.searchParams.set('type', 'magiclink');

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.delete('github_oauth_state');
    response.cookies.delete('desired_username');
    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
  }
}
