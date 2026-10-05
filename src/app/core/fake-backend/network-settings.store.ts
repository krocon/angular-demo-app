import { InjectionToken, Service, computed, signal } from '@angular/core';

/** Random source used by the fake backend. Overridable in tests for deterministic failures. */
export const RANDOM = new InjectionToken<() => number>('RANDOM', { factory: () => Math.random });

export const DEFAULT_LATENCY_MS = 400;

/** Simulated network conditions for the in-memory backend (Network panel in the toolbar). */
@Service()
export class NetworkSettingsStore {
  /** Simulated server latency in milliseconds (0–3000). */
  readonly latencyMs = signal(DEFAULT_LATENCY_MS);
  /** Probability of a simulated 503 in percent (0–100). */
  readonly errorRate = signal(0);
  /** When true every request fails with status 0. */
  readonly offline = signal(false);

  readonly summary = computed(() =>
    this.offline() ? 'Offline' : `${this.latencyMs()} ms · ${this.errorRate()} % errors`,
  );

  reset(): void {
    this.latencyMs.set(DEFAULT_LATENCY_MS);
    this.errorRate.set(0);
    this.offline.set(false);
  }
}
