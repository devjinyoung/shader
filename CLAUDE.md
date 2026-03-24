# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Song Portrait is a real-time generative visualizer that translates Spotify tracks into living shader animations. Users connect their Spotify account, paste a track URL, and see a breathing, pulsing organism shaped by the song's audio features (tempo, energy, valence, etc.).

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Data Flow

1. User authenticates via Spotify OAuth (tokens stored in HTTP-only cookies)
2. User inputs a Spotify track URL → parsed by `src/lib/spotify.ts:parseTrackId()`
3. `/api/spotify/track-data/[id]` fetches track metadata and audio features
4. Audio features map to `VisualParams` which drive the shader uniforms
5. WebGL shader renders the organism in real-time

### Key Layers

**Spotify Integration** (`src/lib/spotify.ts`, `src/app/api/auth/*`, `src/app/api/spotify/*`)
- OAuth flow with automatic token refresh
- Note: Spotify deprecated audio-features API (Nov 2024), so features are estimated from track metadata when unavailable

**Authentication Context** (`src/context/AuthContext.tsx`)
- React context managing auth state with auto-refresh before token expiry
- Wraps app via `Providers.tsx`

**Visualization** (`src/components/Visualizer.tsx`, `src/components/OrganismMaterial.tsx`)
- React Three Fiber canvas with custom shader material
- Visualizer is dynamically imported to avoid SSR issues with Three.js

**Shaders** (`src/shaders/organism.frag`, `organism.vert`)
- GLSL loaded via raw-loader (configured in `next.config.js`)
- Simplex noise + FBM for organic distortion
- HSL color with spectral gradients
- Beat-reactive shockwave effect via `uBeatPulse` uniform

**Visual Parameters** (`src/types/visualParams.ts`)
- 12 parameters controlling color, form, energy, and mood
- Presets: `defaultVisualParams`, `highEnergyParams`, `calmParams`

### UI Controls

- Space key: manual beat trigger
- H key: toggle parameter controls panel
- Parameter sliders in `ParameterControls.tsx`

## Environment Variables

Required in `.env.local`:
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
```

## Future Integration Point

The system is designed for Claude to generate `VisualParams` from track data, producing unique visual "portraits" for each song. The `interpretation` field in `VisualParams` is reserved for Claude's poetic description of the song.
