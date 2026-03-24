import { NextRequest, NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';
import { SpotifyAudioAnalysis } from '@/types/spotify';

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
    const analysis = await spotifyFetch<SpotifyAudioAnalysis>(
      `/audio-analysis/${id}`,
      accessToken
    );

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Error fetching audio analysis:', err);
    return NextResponse.json(
      { error: 'Failed to fetch audio analysis' },
      { status: 500 }
    );
  }
}
