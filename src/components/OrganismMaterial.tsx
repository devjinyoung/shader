'use client';

import { shaderMaterial, useTexture } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
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
    // Texture uniforms
    uTexture: null,
    uTextureAspect: 675.0 / 1200.0, // Image aspect ratio
    // Effect parameters
    uBreathingSpeed: defaultVisualParams.breathingSpeed,
    uPulseIntensity: defaultVisualParams.pulseIntensity,
    uOrganicComplexity: defaultVisualParams.organicComplexity,
    uChaosLevel: defaultVisualParams.chaosLevel,
    uMorphIntensity: 0.03,
    uRippleSpeed: 2.0,
    uScaleBreathAmount: 0.05,
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

  // Load the texture
  const texture = useTexture('/textures/portrait.jpg');

  // Configure texture settings
  useEffect(() => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }, [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      const uniforms = materialRef.current.uniforms;

      // Update time
      uniforms.uTime.value = state.clock.elapsedTime;

      // Update resolution
      uniforms.uResolution.value.set(size.width, size.height);

      // Update beat pulse (with decay)
      uniforms.uBeatPulse.value = beatPulse;

      // Pass texture
      uniforms.uTexture.value = texture;

      // Update effect parameters
      uniforms.uBreathingSpeed.value = params.breathingSpeed;
      uniforms.uPulseIntensity.value = params.pulseIntensity;
      uniforms.uOrganicComplexity.value = params.organicComplexity;
      uniforms.uChaosLevel.value = params.chaosLevel;
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
