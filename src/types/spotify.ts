// Spotify API Types

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  scope: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    release_date: string;
  };
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  uri: string;
  popularity: number;
}

// Audio features - may be estimated if API access is restricted
export interface SpotifyAudioFeatures {
  id: string;
  danceability: number;      // 0-1
  energy: number;            // 0-1
  key: number;               // 0-11 (C, C#, D, etc.)
  loudness: number;          // -60 to 0 dB
  mode: number;              // 0 = minor, 1 = major
  speechiness: number;       // 0-1
  acousticness: number;      // 0-1
  instrumentalness: number;  // 0-1
  liveness: number;          // 0-1
  valence: number;           // 0-1 (musical positiveness)
  tempo: number;             // BPM
  duration_ms: number;
  time_signature: number;    // 3-7
  isEstimated?: boolean;     // True if these are estimated values
}

export interface SpotifyAudioAnalysis {
  meta: {
    analyzer_version: string;
    platform: string;
    detailed_status: string;
    status_code: number;
    timestamp: number;
    analysis_time: number;
    input_process: string;
  };
  track: {
    num_samples: number;
    duration: number;
    sample_md5: string;
    offset_seconds: number;
    window_seconds: number;
    analysis_sample_rate: number;
    analysis_channels: number;
    end_of_fade_in: number;
    start_of_fade_out: number;
    loudness: number;
    tempo: number;
    tempo_confidence: number;
    time_signature: number;
    time_signature_confidence: number;
    key: number;
    key_confidence: number;
    mode: number;
    mode_confidence: number;
  };
  bars: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
  beats: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
  sections: Array<{
    start: number;
    duration: number;
    confidence: number;
    loudness: number;
    tempo: number;
    tempo_confidence: number;
    key: number;
    key_confidence: number;
    mode: number;
    mode_confidence: number;
    time_signature: number;
    time_signature_confidence: number;
  }>;
  segments: Array<{
    start: number;
    duration: number;
    confidence: number;
    loudness_start: number;
    loudness_max: number;
    loudness_max_time: number;
    loudness_end: number;
    pitches: number[];
    timbre: number[];
  }>;
  tatums: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
  isEstimated?: boolean;  // True if this is generated data
}

// Combined track data for our app
export interface TrackData {
  track: SpotifyTrack;
  features: SpotifyAudioFeatures;
  analysis?: SpotifyAudioAnalysis;  // Optional - may not be available
}

// Simplified track info for Claude interpretation
export interface TrackInfo {
  name: string;
  artist: string;
  album: string;
  releaseYear: string;
  durationMs: number;
  popularity: number;
  explicit: boolean;
}
