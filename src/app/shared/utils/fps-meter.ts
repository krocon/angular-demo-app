import { DestroyRef, Signal, inject, signal } from '@angular/core';

export interface FpsMeter {
  readonly fps: Signal<number>;
  start(): void;
  stop(): void;
}

/**
 * requestAnimationFrame-based FPS meter. Must be created in an injection context;
 * stops automatically via DestroyRef.
 */
export function injectFpsMeter(sampleMs = 500): FpsMeter {
  const fps = signal(0);
  let frames = 0;
  let windowStart = 0;
  let handle: number | null = null;

  const loop = (now: number): void => {
    frames++;
    if (now - windowStart >= sampleMs) {
      fps.set(Math.round((frames * 1000) / (now - windowStart)));
      frames = 0;
      windowStart = now;
    }
    handle = requestAnimationFrame(loop);
  };

  const meter: FpsMeter = {
    fps: fps.asReadonly(),
    start() {
      if (handle !== null || typeof requestAnimationFrame === 'undefined') return;
      frames = 0;
      windowStart = performance.now();
      handle = requestAnimationFrame(loop);
    },
    stop() {
      if (handle !== null) {
        cancelAnimationFrame(handle);
        handle = null;
      }
    },
  };
  inject(DestroyRef).onDestroy(() => meter.stop());
  return meter;
}
