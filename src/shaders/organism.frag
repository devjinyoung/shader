precision highp float;

varying vec2 vUv;

// Core uniforms
uniform float uTime;
uniform float uBeatPulse;        // 0-1, decays from beat trigger
uniform vec2 uResolution;

// Texture
uniform sampler2D uTexture;
uniform float uTextureAspect;    // Image width/height ratio

// Effect parameters
uniform float uBreathingSpeed;   // 0.2-2
uniform float uPulseIntensity;   // 0-1
uniform float uOrganicComplexity;// 1-5 (noise octaves)
uniform float uChaosLevel;       // 0-1
uniform float uMorphIntensity;   // 0-0.1
uniform float uRippleSpeed;      // 1-5
uniform float uScaleBreathAmount;// 0-0.15

#define PI 3.14159265359

// Simplex noise functions (kept from original)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// Aspect ratio correction - fit image to screen
vec2 correctAspectRatio(vec2 uv, float screenAspect, float imageAspect) {
  vec2 corrected = uv;

  // Center the UVs
  corrected -= 0.5;

  float aspectRatio = screenAspect / imageAspect;

  if (aspectRatio > 1.0) {
    // Screen is wider than image - fit height, crop width
    corrected.x *= aspectRatio;
  } else {
    // Screen is taller than image - fit width, crop height
    corrected.y /= aspectRatio;
  }

  // Return to 0-1 range
  corrected += 0.5;

  return corrected;
}

// Beat-reactive shape morphing via angular distortion
vec2 applyShapeMorph(vec2 uv, float time, float beatPulse, float breathSpeed, float pulseIntensity, int octaves) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Continuous subtle wobble
  float wobble = sin(angle * 3.0 + time * breathSpeed) * 0.02;

  // Beat-reactive angular distortion - warps the shape on beat
  float beatWarp = sin(angle * 5.0 + time * 2.0) * beatPulse * pulseIntensity * 0.08;

  // Beat-reactive radial noise distortion
  float noise = fbm(vec2(angle * 2.0, dist * 3.0) + time * 0.3, octaves);
  float beatNoise = noise * beatPulse * pulseIntensity * 0.15;

  // Combine distortions
  float totalDistort = wobble + beatWarp + beatNoise;

  // Apply distortion to radius
  float newDist = dist + totalDistort * dist;

  // Reconstruct UV
  vec2 morphed = vec2(cos(angle), sin(angle)) * newDist;

  return morphed + 0.5;
}

// Organic noise morphing
vec2 applyNoiseMorph(vec2 uv, float time, int octaves, float chaosLevel, float morphIntensity) {
  // Sample noise at UV position
  float noiseX = fbm(uv * 3.0 + time * 0.2, octaves);
  float noiseY = fbm(uv * 3.0 + vec2(100.0, 0.0) + time * 0.2, octaves);

  // Create offset from noise
  vec2 offset = vec2(noiseX, noiseY) * morphIntensity * chaosLevel;

  return uv + offset;
}

void main() {
  // Screen aspect ratio
  float screenAspect = uResolution.x / uResolution.y;

  // Start with raw UVs
  vec2 uv = vUv;

  // 1. Aspect ratio correction (fit image to screen)
  uv = correctAspectRatio(uv, screenAspect, uTextureAspect);

  // 2. Apply beat-reactive shape morphing
  int octaves = int(uOrganicComplexity);
  uv = applyShapeMorph(uv, uTime, uBeatPulse, uBreathingSpeed, uPulseIntensity, octaves);

  // 3. Apply additional organic noise morphing (continuous)
  uv = applyNoiseMorph(uv, uTime, octaves, uChaosLevel, uMorphIntensity);

  // 5. Sample texture
  vec4 texColor = texture2D(uTexture, uv);

  // 6. Handle out-of-bounds UVs (fade to black at edges)
  float edgeFade = 1.0;
  vec2 edgeDist = max(vec2(0.0), max(-uv, uv - 1.0));
  edgeFade = 1.0 - smoothstep(0.0, 0.15, length(edgeDist));

  // 7. Beat brightness boost
  float beatBrightness = 1.0 + uBeatPulse * uPulseIntensity * 0.4;

  // Final color
  vec3 finalColor = texColor.rgb * beatBrightness * edgeFade;
  float alpha = texColor.a * edgeFade;

  gl_FragColor = vec4(finalColor, alpha);
}
