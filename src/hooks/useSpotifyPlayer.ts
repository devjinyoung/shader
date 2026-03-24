'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SpotifyPlayerState {
  isReady: boolean;
  isLoading: boolean;
  isPremium: boolean | null; // null = unknown
  error: string | null;
  deviceId: string | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  trackUri: string | null;
}

export interface SpotifyPlayerActions {
  play: (trackUri: string, positionMs?: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  getPosition: () => number;
}

const initialState: SpotifyPlayerState = {
  isReady: false,
  isLoading: true,
  isPremium: null,
  error: null,
  deviceId: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  trackUri: null,
};

export function useSpotifyPlayer(): SpotifyPlayerState & SpotifyPlayerActions {
  const [state, setState] = useState<SpotifyPlayerState>(initialState);
  const playerRef = useRef<Spotify.Player | null>(null);
  const positionRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Fetch token from our API endpoint
  const fetchToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/spotify/token');
      if (!response.ok) return null;
      const data = await response.json();
      return data.access_token;
    } catch {
      return null;
    }
  }, []);

  // Initialize the Spotify player
  const initializePlayer = useCallback(async () => {
    const token = await fetchToken();
    if (!token) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Not authenticated with Spotify',
      }));
      return;
    }

    const player = new window.Spotify.Player({
      name: 'Song Portrait',
      getOAuthToken: (cb) => cb(token),
      volume: 0.5,
    });

    // Ready - Premium account confirmed
    player.addListener('ready', ({ device_id }) => {
      setState((s) => ({
        ...s,
        isReady: true,
        isLoading: false,
        isPremium: true,
        deviceId: device_id,
        error: null,
      }));
    });

    // Not ready
    player.addListener('not_ready', () => {
      setState((s) => ({ ...s, isReady: false }));
    });

    // Player state changed - track position, play state, etc.
    player.addListener('player_state_changed', (playbackState) => {
      if (!playbackState) return;

      console.log('Player state changed:', {
        paused: playbackState.paused,
        position: playbackState.position,
        track: playbackState.track_window.current_track?.name,
      });

      positionRef.current = playbackState.position;
      lastUpdateRef.current = performance.now();
      isPlayingRef.current = !playbackState.paused;

      setState((s) => ({
        ...s,
        isPlaying: !playbackState.paused,
        positionMs: playbackState.position,
        durationMs: playbackState.duration,
        trackUri: playbackState.track_window.current_track?.uri || null,
      }));
    });

    // Error handlers
    player.addListener('initialization_error', ({ message }) => {
      setState((s) => ({ ...s, error: `Init error: ${message}`, isLoading: false }));
    });

    player.addListener('authentication_error', ({ message }) => {
      // Premium detection: error message contains "premium" for non-Premium accounts
      if (message.toLowerCase().includes('premium')) {
        setState((s) => ({
          ...s,
          isPremium: false,
          isLoading: false,
          error: null,
        }));
      } else {
        setState((s) => ({
          ...s,
          error: `Auth error: ${message}`,
          isLoading: false,
        }));
      }
    });

    player.addListener('account_error', ({ message }) => {
      // Also check for premium requirement in account errors
      if (message.toLowerCase().includes('premium')) {
        setState((s) => ({
          ...s,
          isPremium: false,
          isLoading: false,
          error: null,
        }));
      } else {
        setState((s) => ({ ...s, error: `Account error: ${message}`, isLoading: false }));
      }
    });

    player.addListener('playback_error', ({ message }) => {
      console.error('Playback error:', message);
    });

    // Connect to Spotify
    const connected = await player.connect();
    if (!connected) {
      setState((s) => ({
        ...s,
        error: 'Failed to connect to Spotify',
        isLoading: false,
      }));
      return;
    }

    playerRef.current = player;
  }, [fetchToken]);

  // Load SDK script and initialize player
  useEffect(() => {
    // If SDK already loaded, initialize immediately
    if (window.Spotify) {
      initializePlayer();
      return;
    }

    // Set up callback for when SDK is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    // Check if script is already loading
    if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      return;
    }

    // Load the SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: disconnect player
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [initializePlayer]);

  // Interpolated position for accurate beat timing
  const getPosition = useCallback((): number => {
    if (!isPlayingRef.current) {
      return positionRef.current;
    }
    const elapsed = performance.now() - lastUpdateRef.current;
    return positionRef.current + elapsed;
  }, []);

  // Play a track
  const play = useCallback(
    async (trackUri: string, positionMs = 0) => {
      if (!state.deviceId) return;

      const response = await fetch('/api/spotify/play', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: state.deviceId,
          uris: [trackUri],
          position_ms: positionMs,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Play failed:', error);
      }
    },
    [state.deviceId]
  );

  // Pause playback
  const pause = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.pause();
    }
  }, []);

  // Resume playback
  const resume = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.resume();
    }
  }, []);

  // Seek to position
  const seek = useCallback(async (positionMs: number) => {
    if (playerRef.current) {
      await playerRef.current.seek(positionMs);
      // Update refs immediately for smoother beat scheduling
      positionRef.current = positionMs;
      lastUpdateRef.current = performance.now();
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    seek,
    getPosition,
  };
}
