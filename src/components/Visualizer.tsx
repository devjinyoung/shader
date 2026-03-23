'use client';

import { Canvas } from '@react-three/fiber';
import { OrganismMaterial } from './OrganismMaterial';
import { VisualParams, defaultVisualParams } from '@/types/visualParams';

interface VisualizerProps {
  params?: VisualParams;
  beatPulse?: number;
}

function Scene({ params, beatPulse }: VisualizerProps) {
  return (
    <mesh>
      {/* Fullscreen quad */}
      <planeGeometry args={[2, 2]} />
      <OrganismMaterial
        params={params || defaultVisualParams}
        beatPulse={beatPulse}
      />
    </mesh>
  );
}

export function Visualizer({ params, beatPulse = 0 }: VisualizerProps) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <color attach="background" args={['#000000']} />
        <Scene params={params} beatPulse={beatPulse} />
      </Canvas>
    </div>
  );
}
