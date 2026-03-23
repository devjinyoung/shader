'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { VisualParams, defaultVisualParams } from '@/types/visualParams';
import { ParameterControls } from '@/components/ParameterControls';

// Dynamic import to avoid SSR issues with Three.js
const Visualizer = dynamic(
  () => import('@/components/Visualizer').then((mod) => mod.Visualizer),
  { ssr: false }
);

export default function Home() {
  const [params, setParams] = useState<VisualParams>(defaultVisualParams);
  const [beatPulse, setBeatPulse] = useState(0);
  const [showControls, setShowControls] = useState(true);

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

  // Keyboard shortcuts
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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Visualizer */}
      <Visualizer params={params} beatPulse={beatPulse} />

      {/* Parameter Controls */}
      <ParameterControls
        params={params}
        onChange={setParams}
        onBeat={triggerBeat}
        visible={showControls}
      />

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 z-20 text-xs text-gray-600">
        <p>Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">Space</kbd> to trigger beat</p>
        <p>Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">H</kbd> to toggle controls</p>
      </div>

      {/* Title */}
      <div className="fixed top-4 left-4 z-20">
        <h1 className="text-lg font-light text-white/80">Song Portrait</h1>
        <p className="text-xs text-gray-600">Phase 1: Shader Foundation</p>
      </div>
    </main>
  );
}
