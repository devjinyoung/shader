import { NextRequest, NextResponse } from 'next/server';

/**
 * Expose access token to client for Spotify Web Playback SDK initialization.
 * The SDK requires the raw token, which is stored in HTTP-only cookies.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const expiresAt = request.cookies.get('spotify_expires_at')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Check if token is expired
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    return NextResponse.json(
      { error: 'Token expired' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    access_token: accessToken,
    expires_at: expiresAt ? parseInt(expiresAt) : null,
  });
}
