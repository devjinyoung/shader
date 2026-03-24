import { NextRequest, NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';
import { SpotifyAudioFeatures } from '@/types/spotify';

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
    const features = await spotifyFetch<SpotifyAudioFeatures>(
      `/audio-features/${id}`,
      accessToken
    );

    return NextResponse.json(features);
  } catch (err) {
    console.error('Error fetching audio features:', err);
    return NextResponse.json(
      { error: 'Failed to fetch audio features' },
      { status: 500 }
    );
  }
}
