'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { BeatScheduler, generateSyntheticBeats, Beat } from '@/lib/beatScheduler';
import { SpotifyAudioAnalysis, TrackData } from '@/types/spotify';

interface PlaybackContextType {
  // Player state
  isPlayerReady: boolean;
  isPlayerLoading: boolean;
  isPremium: boolean | null;
  playerError: string | null;

  // Playback state
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;

  // Track state
  currentTrack: TrackData | null;

  // Actions
  loadAndPlay: (track: TrackData) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;

  // Beat events - returns unsubscribe function
  onBeat: (callback: () => void) => () => void;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const player = useSpotifyPlayer();
  const [currentTrack, setCurrentTrack] = useState<TrackData | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);

  const schedulerRef = useRef<BeatScheduler | null>(null);
  const beatCallbacksRef = useRef<Set<() => void>>(new Set());

  // Beat callback handler - notifies all subscribers
  const handleBeat = useCallback(() => {
    console.log('🥁 Beat fired!');
    beatCallbacksRef.current.forEach((cb) => cb());
  }, []);

  // Initialize/update scheduler when beats or player changes
  useEffect(() => {
    if (beats.length === 0 || !player.isReady) return;

    if (schedulerRef.current) {
      schedulerRef.current.setBeats(beats);
    } else {
      schedulerRef.current = new BeatScheduler({
        beats,
        onBeat: handleBeat,
        getPositionMs: player.getPosition,
        lookaheadMs: 50, // Fire early to compensate for React render latency
      });
    }
  }, [beats, player.isReady, player.getPosition, handleBeat]);

  // Start/stop scheduler based on playback state
  useEffect(() => {
    console.log('Playback state changed:', { isPlaying: player.isPlaying, hasScheduler: !!schedulerRef.current });
    if (player.isPlaying && schedulerRef.current) {
      console.log('Starting beat scheduler');
      schedulerRef.current.start();
    } else if (schedulerRef.current) {
      console.log('Stopping beat scheduler');
      schedulerRef.current.stop();
    }
  }, [player.isPlaying]);

  // Fetch analysis when loading a track
  const loadAndPlay = useCallback(
    async (track: TrackData) => {
      setCurrentTrack(track);

      // Try to fetch audio analysis for beat timing
      let analysisBeats: Beat[];
      try {
        const response = await fetch(`/api/spotify/analysis/${track.track.id}`);
        if (response.ok) {
          const analysisData: SpotifyAudioAnalysis = await response.json();
          analysisBeats = analysisData.beats;
          console.log(`Loaded ${analysisBeats.length} beats from Spotify analysis`);
        } else {
          // Fallback to synthetic beats
          console.log('Audio analysis unavailable, using synthetic beats');
          analysisBeats = generateSyntheticBeats(
            track.track.duration_ms,
            track.features.tempo
          );
        }
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
        analysisBeats = generateSyntheticBeats(
          track.track.duration_ms,
          track.features.tempo
        );
      }

      setBeats(analysisBeats);

      // Reset scheduler position
      if (schedulerRef.current) {
        schedulerRef.current.seek(0);
      }

      // Start playback (Premium only)
      if (player.isPremium && player.isReady) {
        await player.play(track.track.uri);
      }
    },
    [player]
  );

  // Subscribe to beat events
  const onBeat = useCallback((callback: () => void) => {
    beatCallbacksRef.current.add(callback);
    return () => {
      beatCallbacksRef.current.delete(callback);
    };
  }, []);

  // Seek handler - reset scheduler position
  const seek = useCallback(
    async (positionMs: number) => {
      await player.seek(positionMs);
      schedulerRef.current?.seek(positionMs);
    },
    [player]
  );

  return (
    <PlaybackContext.Provider
      value={{
        isPlayerReady: player.isReady,
        isPlayerLoading: player.isLoading,
        isPremium: player.isPremium,
        playerError: player.error,
        isPlaying: player.isPlaying,
        positionMs: player.positionMs,
        durationMs: player.durationMs,
        currentTrack,
        loadAndPlay,
        play: player.resume,
        pause: player.pause,
        seek,
        onBeat,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within PlaybackProvider');
  }
  return context;
}
