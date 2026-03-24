import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy playback commands to Spotify Web API.
 * Required because the Web API needs the access token from server-side cookies.
 */
export async function PUT(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { device_id, uris, position_ms = 0 } = body;

    if (!device_id || !uris || !Array.isArray(uris)) {
      return NextResponse.json(
        { error: 'Missing device_id or uris' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris,
          position_ms,
        }),
      }
    );

    // 204 No Content is success for this endpoint
    if (response.status === 204 || response.ok) {
      return NextResponse.json({ success: true });
    }

    const error = await response.text();
    return NextResponse.json(
      { error: `Spotify API error: ${error}` },
      { status: response.status }
    );
  } catch (err) {
    console.error('Play error:', err);
    return NextResponse.json(
      { error: 'Failed to start playback' },
      { status: 500 }
    );
  }
}
