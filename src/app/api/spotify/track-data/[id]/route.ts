import { NextRequest, NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';
import { SpotifyTrack, SpotifyAudioFeatures, TrackData } from '@/types/spotify';

/**
 * Generate estimated audio features based on track metadata
 * Since Spotify deprecated audio-features API for new apps (Nov 2024),
 * we provide reasonable defaults that can be refined by Claude later.
 */
function generateEstimatedFeatures(track: SpotifyTrack): SpotifyAudioFeatures {
  // Use popularity as a rough proxy for energy/danceability
  const popularity = track.popularity / 100;

  return {
    id: track.id,
    // Reasonable middle-ground defaults
    danceability: 0.5 + (popularity * 0.2),
    energy: 0.5 + (popularity * 0.2),
    key: 0,  // C
    loudness: -8,
    mode: 1,  // Major
    speechiness: 0.1,
    acousticness: 0.3,
    instrumentalness: 0.1,
    liveness: 0.2,
    valence: 0.5,
    tempo: 120,  // Default BPM
    duration_ms: track.duration_ms,
    time_signature: 4,
    isEstimated: true,
  };
}

/**
 * Generate estimated beats based on duration and estimated tempo
 */
function generateEstimatedBeats(durationMs: number, tempo: number = 120) {
  const durationSec = durationMs / 1000;
  const beatDuration = 60 / tempo;
  const numBeats = Math.floor(durationSec / beatDuration);

  const beats = [];
  for (let i = 0; i < numBeats; i++) {
    beats.push({
      start: i * beatDuration,
      duration: beatDuration,
      confidence: 0.8,
    });
  }

  return beats;
}

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
    // Fetch track metadata (this still works)
    const track = await spotifyFetch<SpotifyTrack>(
      `/tracks/${id}`,
      accessToken
    );

    // Try to get audio features (may fail with 403)
    let features: SpotifyAudioFeatures;
    try {
      features = await spotifyFetch<SpotifyAudioFeatures>(
        `/audio-features/${id}`,
        accessToken
      );
    } catch (err) {
      console.log('Audio features unavailable (API restricted), using estimates');
      features = generateEstimatedFeatures(track);
    }

    // Build response
    const trackData: TrackData = {
      track,
      features,
      // Analysis is optional - we'll generate beats from tempo if needed
    };

    return NextResponse.json(trackData);
  } catch (err) {
    console.error('Error fetching track data:', err);
    return NextResponse.json(
      { error: 'Failed to fetch track data' },
      { status: 500 }
    );
  }
}
