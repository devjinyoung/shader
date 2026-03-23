'use client';

import { useState } from 'react';
import { VisualParams, defaultVisualParams, highEnergyParams, calmParams } from '@/types/visualParams';

interface ParameterControlsProps {
  params: VisualParams;
  onChange: (params: VisualParams) => void;
  onBeat: () => void;
  visible: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step = 0.01, onChange }: SliderProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="w-24 text-gray-400">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
      <span className="w-12 text-right text-gray-500">{value.toFixed(2)}</span>
    </div>
  );
}

export function ParameterControls({ params, onChange, onBeat, visible }: ParameterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateParam = <K extends keyof VisualParams>(key: K, value: VisualParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-20 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg p-4 w-80 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Visual Parameters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white text-xs"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Presets */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onChange(defaultVisualParams)}
              className="flex-1 px-2 py-1 text-xs bg-purple-900/50 hover:bg-purple-900 rounded transition"
            >
              Default
            </button>
            <button
              onClick={() => onChange(highEnergyParams)}
              className="flex-1 px-2 py-1 text-xs bg-orange-900/50 hover:bg-orange-900 rounded transition"
            >
              High Energy
            </button>
            <button
              onClick={() => onChange(calmParams)}
              className="flex-1 px-2 py-1 text-xs bg-blue-900/50 hover:bg-blue-900 rounded transition"
            >
              Calm
            </button>
          </div>

          {/* Beat trigger */}
          <button
            onClick={onBeat}
            className="w-full mb-4 px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded font-medium text-sm transition"
          >
            Trigger Beat
          </button>

          {/* Color section */}
          <div className="mb-4">
            <h4 className="text-xs text-gray-500 uppercase mb-2">Color</h4>
            <div className="space-y-2">
              <Slider
                label="Hue Anchor"
                value={params.hueAnchor}
                min={0}
                max={360}
                step={1}
                onChange={(v) => updateParam('hueAnchor', v)}
              />
              <Slider
                label="Hue Spread"
                value={params.hueSpread}
                min={0}
                max={180}
                step={1}
                onChange={(v) => updateParam('hueSpread', v)}
              />
              <Slider
                label="Saturation"
                value={params.saturation}
                min={0}
                max={1}
                onChange={(v) => updateParam('saturation', v)}
              />
              <Slider
                label="Brightness"
                value={params.brightness}
                min={0}
                max={1}
                onChange={(v) => updateParam('brightness', v)}
              />
            </div>
          </div>

          {/* Form section */}
          <div className="mb-4">
            <h4 className="text-xs text-gray-500 uppercase mb-2">Form</h4>
            <div className="space-y-2">
              <Slider
                label="Symmetry"
                value={params.symmetryOrder}
                min={2}
                max={8}
                step={1}
                onChange={(v) => updateParam('symmetryOrder', v)}
              />
              <Slider
                label="Base Radius"
                value={params.baseRadius}
                min={0.1}
                max={0.6}
                onChange={(v) => updateParam('baseRadius', v)}
              />
              <Slider
                label="Complexity"
                value={params.organicComplexity}
                min={1}
                max={5}
                step={1}
                onChange={(v) => updateParam('organicComplexity', v)}
              />
            </div>
          </div>

          {/* Energy section */}
          <div className="mb-4">
            <h4 className="text-xs text-gray-500 uppercase mb-2">Energy</h4>
            <div className="space-y-2">
              <Slider
                label="Chaos Level"
                value={params.chaosLevel}
                min={0}
                max={1}
                onChange={(v) => updateParam('chaosLevel', v)}
              />
              <Slider
                label="Breathing"
                value={params.breathingSpeed}
                min={0.1}
                max={2}
                onChange={(v) => updateParam('breathingSpeed', v)}
              />
              <Slider
                label="Pulse Int."
                value={params.pulseIntensity}
                min={0}
                max={1}
                onChange={(v) => updateParam('pulseIntensity', v)}
              />
            </div>
          </div>

          {/* Mood section */}
          <div>
            <h4 className="text-xs text-gray-500 uppercase mb-2">Mood</h4>
            <div className="space-y-2">
              <Slider
                label="Glow"
                value={params.glowIntensity}
                min={0}
                max={1}
                onChange={(v) => updateParam('glowIntensity', v)}
              />
              <Slider
                label="Edge Soft"
                value={params.edgeSoftness}
                min={0}
                max={1}
                onChange={(v) => updateParam('edgeSoftness', v)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
