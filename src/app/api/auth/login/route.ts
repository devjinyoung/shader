import { NextResponse } from 'next/server';
import { getAuthUrl, generateState } from '@/lib/spotify';

export async function GET() {
  // Generate a random state for CSRF protection
  const state = generateState();

  // Get the Spotify authorization URL
  const authUrl = getAuthUrl(state);

  // Create response with redirect
  const response = NextResponse.redirect(authUrl);

  // Store state in cookie for verification in callback
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
