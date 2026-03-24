'use client';

import { useState } from 'react';
import { parseTrackId } from '@/lib/utils';
import { TrackData } from '@/types/spotify';

interface TrackInputProps {
  onTrackLoaded: (data: TrackData) => void;
  disabled?: boolean;
}

export function TrackInput({ onTrackLoaded, disabled }: TrackInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trackId = parseTrackId(input);
    if (!trackId) {
      setError('Invalid Spotify track URL or ID');
      return;
    }

    setIsLoading(true);

    try {
      // Use unified endpoint that handles missing audio features gracefully
      const response = await fetch(`/api/spotify/track-data/${trackId}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to fetch track data');
      }

      const trackData: TrackData = await response.json();

      // Notify if features are estimated
      if (trackData.features.isEstimated) {
        console.log('Note: Audio features are estimated (Spotify API restricted)');
      }

      onTrackLoaded(trackData);
      setInput('');
    } catch (err) {
      console.error('Error fetching track:', err);
      setError('Failed to load track. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste Spotify track URL..."
            disabled={disabled || isLoading}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-purple-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={disabled || isLoading || !input.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700
                       disabled:cursor-not-allowed rounded-lg font-medium transition"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Load'
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}
