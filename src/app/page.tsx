'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { usePlayback } from '@/context/PlaybackContext';
import { VisualParams, defaultVisualParams } from '@/types/visualParams';
import { TrackData } from '@/types/spotify';
import { ParameterControls } from '@/components/ParameterControls';
import { TrackInput } from '@/components/TrackInput';
import { PlayerControls } from '@/components/PlayerControls';

// Dynamic import to avoid SSR issues with Three.js
const Visualizer = dynamic(
  () => import('@/components/Visualizer').then((mod) => mod.Visualizer),
  { ssr: false }
);

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { onBeat, isPremium, loadAndPlay, currentTrack } = usePlayback();
  const [params, setParams] = useState<VisualParams>(defaultVisualParams);
  const [beatPulse, setBeatPulse] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [trackData, setTrackData] = useState<TrackData | null>(null);

  // Beat pulse decay
  useEffect(() => {
    if (beatPulse > 0) {
      const decay = requestAnimationFrame(() => {
        setBeatPulse((prev) => Math.max(0, prev - 0.03));
      });
      return () => cancelAnimationFrame(decay);
    }
  }, [beatPulse]);

  const triggerBeat = useCallback(() => {
    setBeatPulse(1);
  }, []);

  // Subscribe to automatic beat events from playback context (Premium users)
  useEffect(() => {
    if (isPremium && currentTrack) {
      return onBeat(triggerBeat);
    }
  }, [isPremium, currentTrack, onBeat, triggerBeat]);

  // Keyboard shortcuts (manual beat for non-Premium or testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerBeat();
      }
      if (e.code === 'KeyH') {
        setShowControls((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerBeat]);

  const handleTrackLoaded = useCallback(
    async (data: TrackData) => {
      setTrackData(data);
      console.log('Track loaded:', data.track.name);
      console.log('Audio features:', data.features);

      // Load and start playback via PlaybackContext
      await loadAndPlay(data);
    },
    [loadAndPlay]
  );

  // Show loading state
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Visualizer */}
      <Visualizer params={params} beatPulse={beatPulse} />

      {/* Auth & Track Input Overlay */}
      {!trackData && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center max-w-md px-6">
            <h1 className="text-4xl font-light mb-2">Song Portrait</h1>
            <p className="text-gray-400 mb-8">See the soul of a song</p>

            {!isAuthenticated ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Connect your Spotify account to get started
                </p>
                <button
                  onClick={login}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-full font-medium transition flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Connect with Spotify
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <TrackInput onTrackLoaded={handleTrackLoaded} />
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-300 transition"
                >
                  Disconnect Spotify
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Track Info */}
      {trackData && (
        <div className="fixed top-4 left-4 z-20">
          <div className="flex items-center gap-3 mb-2">
            {trackData.track.album.images[0] && (
              <img
                src={trackData.track.album.images[0].url}
                alt={trackData.track.album.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div>
              <h2 className="font-medium text-white">{trackData.track.name}</h2>
              <p className="text-sm text-gray-400">
                {trackData.track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>BPM: {Math.round(trackData.features.tempo)} | Energy: {(trackData.features.energy * 100).toFixed(0)}%</p>
            <p>Valence: {(trackData.features.valence * 100).toFixed(0)}% | Danceability: {(trackData.features.danceability * 100).toFixed(0)}%</p>
            {trackData.features.isEstimated && (
              <p className="text-yellow-600/70">* Audio features estimated</p>
            )}
          </div>
          <button
            onClick={() => setTrackData(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-300"
          >
            Load another track
          </button>
        </div>
      )}

      {/* Parameter Controls */}
      <ParameterControls
        params={params}
        onChange={setParams}
        onBeat={triggerBeat}
        visible={showControls && !!trackData}
      />

      {/* Player Controls */}
      {trackData && <PlayerControls />}

      {/* Instructions */}
      {trackData && (
        <div className="fixed bottom-4 left-4 z-20 text-xs text-gray-600">
          <p>Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">Space</kbd> to trigger beat</p>
          <p>Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">H</kbd> to toggle controls</p>
        </div>
      )}
    </main>
  );
}
