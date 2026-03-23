'use client';

import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { VisualParams, defaultVisualParams } from '@/types/visualParams';

// Import shaders as raw strings
import vertexShader from '@/shaders/organism.vert';
import fragmentShader from '@/shaders/organism.frag';

// Create the shader material
const OrganismShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uBeatPulse: 0,
    uResolution: new THREE.Vector2(1, 1),
    uHueAnchor: defaultVisualParams.hueAnchor,
    uHueSpread: defaultVisualParams.hueSpread,
    uSaturation: defaultVisualParams.saturation,
    uBrightness: defaultVisualParams.brightness,
    uSymmetryOrder: defaultVisualParams.symmetryOrder,
    uBaseRadius: defaultVisualParams.baseRadius,
    uOrganicComplexity: defaultVisualParams.organicComplexity,
    uChaosLevel: defaultVisualParams.chaosLevel,
    uBreathingSpeed: defaultVisualParams.breathingSpeed,
    uPulseIntensity: defaultVisualParams.pulseIntensity,
    uGlowIntensity: defaultVisualParams.glowIntensity,
    uEdgeSoftness: defaultVisualParams.edgeSoftness,
  },
  vertexShader,
  fragmentShader
);

// Extend Three.js with our custom material
extend({ OrganismShaderMaterial });

// Add type declaration for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      organismShaderMaterial: any;
    }
  }
}

interface OrganismMaterialProps {
  params: VisualParams;
  beatPulse?: number;
}

export function OrganismMaterial({ params, beatPulse = 0 }: OrganismMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      const uniforms = materialRef.current.uniforms;

      // Update time
      uniforms.uTime.value = state.clock.elapsedTime;

      // Update resolution
      uniforms.uResolution.value.set(size.width, size.height);

      // Update beat pulse (with decay)
      uniforms.uBeatPulse.value = beatPulse;

      // Update visual parameters
      uniforms.uHueAnchor.value = params.hueAnchor;
      uniforms.uHueSpread.value = params.hueSpread;
      uniforms.uSaturation.value = params.saturation;
      uniforms.uBrightness.value = params.brightness;
      uniforms.uSymmetryOrder.value = params.symmetryOrder;
      uniforms.uBaseRadius.value = params.baseRadius;
      uniforms.uOrganicComplexity.value = params.organicComplexity;
      uniforms.uChaosLevel.value = params.chaosLevel;
      uniforms.uBreathingSpeed.value = params.breathingSpeed;
      uniforms.uPulseIntensity.value = params.pulseIntensity;
      uniforms.uGlowIntensity.value = params.glowIntensity;
      uniforms.uEdgeSoftness.value = params.edgeSoftness;
    }
  });

  return (
    <organismShaderMaterial
      ref={materialRef}
      transparent
      depthWrite={false}
    />
  );
}
