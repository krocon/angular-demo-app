import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { LifecycleLogStore } from './lifecycle-log.store';

export const FEATURE_NAME = new InjectionToken<string>('FEATURE_NAME');

let instances = 0;

/**
 * Scoped to a route via `providers`. Each route injector gets its own instance; with
 * withAutoCleanupInjectors() it is destroyed when the route becomes inactive.
 */
@Injectable()
export class FeatureSessionService {
  readonly #log = inject(LifecycleLogStore);
  readonly feature = inject(FEATURE_NAME);
  readonly instanceId = ++instances;
  readonly startedAt = new Date();
  readonly secondsAlive = signal(0);

  constructor() {
    this.#log.log(`FeatureSessionService #${this.instanceId} created for ${this.feature}`);
    const timer = setInterval(() => this.secondsAlive.update((s) => s + 1), 1000);
    // DestroyRef of the route's EnvironmentInjector: cleanup for timers, sockets, …
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.#log.log(
        `FeatureSessionService #${this.instanceId} destroyed (${this.feature}) – timer cleared`,
      );
    });
  }
}
