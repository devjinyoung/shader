import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Get stored state from cookie
  const storedState = request.cookies.get('spotify_auth_state')?.value;

  // Redirect URL for errors
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';

  // Handle errors from Spotify
  if (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(error)}`);
  }

  // Verify state matches
  if (!state || state !== storedState) {
    console.error('State mismatch:', { state, storedState });
    return NextResponse.redirect(`${appUrl}?error=state_mismatch`);
  }

  // Verify we have a code
  if (!code) {
    return NextResponse.redirect(`${appUrl}?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Calculate expiration time
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    // Create response and redirect to app
    const response = NextResponse.redirect(`${appUrl}?auth=success`);

    // Clear the state cookie
    response.cookies.delete('spotify_auth_state');

    // Store tokens in httpOnly cookies
    response.cookies.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });

    response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    response.cookies.set('spotify_expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Token exchange error:', err);
    return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
  }
}
