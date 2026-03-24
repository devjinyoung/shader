import { NextRequest, NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';
import { SpotifyTrack } from '@/types/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const track = await spotifyFetch<SpotifyTrack>(
      `/tracks/${id}`,
      accessToken
    );

    return NextResponse.json(track);
  } catch (err) {
    console.error('Error fetching track:', err);
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    );
  }
}
