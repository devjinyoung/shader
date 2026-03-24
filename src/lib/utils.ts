/**
 * Parse a Spotify track URL or URI to extract the track ID
 * Supports:
 * - https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6
 * - https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=...
 * - spotify:track:6rqhFgbbKwnb9MLmUQDhG6
 * - 6rqhFgbbKwnb9MLmUQDhG6 (just the ID)
 */
export function parseTrackId(input: string): string | null {
  const trimmed = input.trim();

  // URL format (with optional query params)
  const urlMatch = trimmed.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  // URI format
  const uriMatch = trimmed.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Just the ID (22 chars, alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
