'use client';

import { usePlayback } from '@/context/PlaybackContext';
import { useCallback, useEffect, useState } from 'react';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerControls() {
  const {
    isPlayerReady,
    isPlayerLoading,
    isPremium,
    playerError,
    isPlaying,
    positionMs,
    durationMs,
    currentTrack,
    play,
    pause,
    seek,
  } = usePlayback();

  // Local position state for smooth progress bar (updated every 100ms when playing)
  const [displayPosition, setDisplayPosition] = useState(positionMs);

  useEffect(() => {
    setDisplayPosition(positionMs);
  }, [positionMs]);

  // Interpolate position for smooth progress bar
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDisplayPosition((prev) => Math.min(prev + 100, durationMs));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, durationMs]);

  // Progress percentage
  const progress = durationMs > 0 ? (displayPosition / durationMs) * 100 : 0;

  // Handle seek from progress bar click
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newPosition = Math.floor(percentage * durationMs);
      seek(newPosition);
      setDisplayPosition(newPosition);
    },
    [durationMs, seek]
  );

  // Non-Premium message
  if (isPremium === false) {
    return (
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20
                      bg-gray-900/90 backdrop-blur rounded-lg p-4 text-center max-w-md"
      >
        <p className="text-yellow-400 font-medium mb-2">Premium Required</p>
        <p className="text-sm text-gray-400">
          Spotify Premium is required for synchronized playback. The visualization works
          in manual beat mode - press Space to trigger beats.
        </p>
      </div>
    );
  }

  // Loading state
  if (isPlayerLoading) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Spotify...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (playerError) {
    return (
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20
                      bg-red-900/50 rounded-lg p-3 text-sm text-red-300"
      >
        {playerError}
      </div>
    );
  }

  // Not ready yet or no track
  if (!isPlayerReady || !currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
      <div className="bg-gray-900/90 backdrop-blur rounded-lg p-4">
        {/* Play/Pause button */}
        <div className="flex items-center justify-center mb-3">
          <button
            onClick={isPlaying ? pause : play}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center
                       hover:scale-105 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              // Pause icon
              <svg
                className="w-5 h-5 text-black"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              // Play icon
              <svg
                className="w-5 h-5 text-black ml-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 bg-gray-700 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-purple-500 rounded-full relative group-hover:bg-purple-400 transition-colors"
            style={{ width: `${progress}%` }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3
                            bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Time display */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{formatTime(displayPosition)}</span>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}
