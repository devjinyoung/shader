/**
 * Type declarations for Spotify Web Playback SDK
 * https://developer.spotify.com/documentation/web-playback-sdk
 */

declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }

  namespace Spotify {
    interface PlayerInit {
      name: string;
      getOAuthToken: (callback: (token: string) => void) => void;
      volume?: number;
    }

    class Player {
      constructor(options: PlayerInit);

      connect(): Promise<boolean>;
      disconnect(): void;

      addListener(event: 'ready', callback: (state: { device_id: string }) => void): void;
      addListener(event: 'not_ready', callback: (state: { device_id: string }) => void): void;
      addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void;
      addListener(event: 'initialization_error', callback: (error: { message: string }) => void): void;
      addListener(event: 'authentication_error', callback: (error: { message: string }) => void): void;
      addListener(event: 'account_error', callback: (error: { message: string }) => void): void;
      addListener(event: 'playback_error', callback: (error: { message: string }) => void): void;
      addListener(event: string, callback: (state: any) => void): void;

      removeListener(event: string, callback?: (state: any) => void): void;

      getCurrentState(): Promise<PlaybackState | null>;
      setName(name: string): Promise<void>;
      getVolume(): Promise<number>;
      setVolume(volume: number): Promise<void>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      togglePlay(): Promise<void>;
      seek(positionMs: number): Promise<void>;
      previousTrack(): Promise<void>;
      nextTrack(): Promise<void>;
    }

    interface PlaybackState {
      paused: boolean;
      position: number;
      duration: number;
      repeat_mode: number;
      shuffle: boolean;
      track_window: TrackWindow;
      context: {
        uri: string | null;
        metadata: Record<string, string> | null;
      };
      disallows: {
        pausing?: boolean;
        peeking_next?: boolean;
        peeking_prev?: boolean;
        resuming?: boolean;
        seeking?: boolean;
        skipping_next?: boolean;
        skipping_prev?: boolean;
      };
    }

    interface TrackWindow {
      current_track: Track | null;
      previous_tracks: Track[];
      next_tracks: Track[];
    }

    interface Track {
      uri: string;
      id: string;
      type: 'track' | 'episode' | 'ad';
      media_type: 'audio' | 'video';
      name: string;
      is_playable: boolean;
      album: Album;
      artists: Artist[];
    }

    interface Album {
      uri: string;
      name: string;
      images: Image[];
    }

    interface Artist {
      uri: string;
      name: string;
    }

    interface Image {
      url: string;
      height?: number;
      width?: number;
    }
  }
}

export {};
