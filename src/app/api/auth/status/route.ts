import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const expiresAt = request.cookies.get('spotify_expires_at')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  const isExpired = expiresAt ? Date.now() > parseInt(expiresAt) : true;

  return NextResponse.json({
    authenticated: !isExpired,
    expires_at: expiresAt ? parseInt(expiresAt) : null,
  });
}
