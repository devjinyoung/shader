export interface VisualParams {
  // Color
  hueAnchor: number;        // 0-360, base hue for palette
  hueSpread: number;        // 0-180, how much spectrum to use
  saturation: number;       // 0-1
  brightness: number;       // 0-1

  // Form
  symmetryOrder: number;    // 2-8, radial symmetry fold count
  baseRadius: number;       // 0.2-0.6, organism size
  organicComplexity: number;// 1-5, noise octaves

  // Energy/Movement
  chaosLevel: number;       // 0-1, distortion intensity
  breathingSpeed: number;   // 0.2-2, base animation rate
  pulseIntensity: number;   // 0-1, beat reaction strength

  // Mood
  glowIntensity: number;    // 0-1, bloom amount
  edgeSoftness: number;     // 0-1, how diffuse the edges

  // Poetic interpretation (displayed as caption)
  interpretation?: string;  // 1-2 sentences
}

// Default parameters - a calm, meditative state
export const defaultVisualParams: VisualParams = {
  hueAnchor: 280,          // Purple/violet base
  hueSpread: 60,           // Moderate spectrum
  saturation: 0.7,
  brightness: 0.6,
  symmetryOrder: 6,        // Hexagonal symmetry
  baseRadius: 0.35,
  organicComplexity: 3,
  chaosLevel: 0.3,
  breathingSpeed: 0.5,
  pulseIntensity: 0.5,
  glowIntensity: 0.6,
  edgeSoftness: 0.5,
};

// High energy preset - for testing
export const highEnergyParams: VisualParams = {
  hueAnchor: 30,           // Orange/red base
  hueSpread: 120,          // Wide spectrum
  saturation: 0.9,
  brightness: 0.8,
  symmetryOrder: 4,
  baseRadius: 0.4,
  organicComplexity: 5,
  chaosLevel: 0.8,
  breathingSpeed: 1.5,
  pulseIntensity: 0.9,
  glowIntensity: 0.8,
  edgeSoftness: 0.3,
};

// Calm preset - for testing
export const calmParams: VisualParams = {
  hueAnchor: 200,          // Blue/cyan base
  hueSpread: 40,           // Narrow spectrum
  saturation: 0.5,
  brightness: 0.5,
  symmetryOrder: 8,
  baseRadius: 0.3,
  organicComplexity: 2,
  chaosLevel: 0.1,
  breathingSpeed: 0.3,
  pulseIntensity: 0.2,
  glowIntensity: 0.4,
  edgeSoftness: 0.7,
};
