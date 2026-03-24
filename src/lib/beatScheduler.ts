/**
 * Beat Scheduler - matches playback position to beats and fires callbacks
 */

export interface Beat {
  start: number; // seconds
  duration: number;
  confidence: number;
}

export interface BeatSchedulerOptions {
  beats: Beat[];
  onBeat: (beat: Beat, index: number) => void;
  getPositionMs: () => number;
  lookaheadMs?: number; // Fire this many ms early (default 20)
  confidenceThreshold?: number; // Skip beats below this confidence (default 0.3)
}

export class BeatScheduler {
  private beats: Beat[];
  private onBeat: (beat: Beat, index: number) => void;
  private getPositionMs: () => number;
  private lookaheadMs: number;
  private confidenceThreshold: number;

  private currentBeatIndex: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private firedBeats: Set<number> = new Set();

  constructor(options: BeatSchedulerOptions) {
    this.beats = options.beats;
    this.onBeat = options.onBeat;
    this.getPositionMs = options.getPositionMs;
    this.lookaheadMs = options.lookaheadMs ?? 20;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.3;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Call when seeking to reset beat index
   */
  seek(positionMs: number): void {
    this.currentBeatIndex = this.findBeatIndex(positionMs / 1000);
    this.firedBeats.clear();
  }

  /**
   * Update beats (e.g., when loading new track)
   */
  setBeats(beats: Beat[]): void {
    this.beats = beats;
    this.currentBeatIndex = 0;
    this.firedBeats.clear();
  }

  /**
   * Binary search for beat at or just before position
   */
  private findBeatIndex(positionSec: number): number {
    if (this.beats.length === 0) return 0;

    let low = 0;
    let high = this.beats.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      if (this.beats[mid].start <= positionSec) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }

    return low;
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const positionMs = this.getPositionMs();
    const positionSec = positionMs / 1000;
    const lookaheadSec = this.lookaheadMs / 1000;

    // Check upcoming beats within lookahead window
    while (this.currentBeatIndex < this.beats.length) {
      const beat = this.beats[this.currentBeatIndex];
      const beatTimeMs = beat.start * 1000;

      // If beat is in the past (we've passed it), skip
      if (beatTimeMs < positionMs - 100) {
        this.currentBeatIndex++;
        continue;
      }

      // If beat is within lookahead window and not fired
      if (beat.start <= positionSec + lookaheadSec) {
        if (!this.firedBeats.has(this.currentBeatIndex)) {
          if (beat.confidence >= this.confidenceThreshold) {
            this.onBeat(beat, this.currentBeatIndex);
          }
          this.firedBeats.add(this.currentBeatIndex);
        }
        this.currentBeatIndex++;
      } else {
        // Next beat is too far in the future
        break;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

/**
 * Generate synthetic beats from tempo when audio analysis is unavailable
 */
export function generateSyntheticBeats(durationMs: number, tempo: number = 120): Beat[] {
  const durationSec = durationMs / 1000;
  const beatInterval = 60 / tempo;
  const numBeats = Math.floor(durationSec / beatInterval);

  return Array.from({ length: numBeats }, (_, i) => ({
    start: i * beatInterval,
    duration: beatInterval,
    confidence: 0.8,
  }));
}
