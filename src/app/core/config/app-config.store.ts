import { HttpClient, HttpContext } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../fake-backend/fake-db';
import { SKIP_ERROR_HANDLING } from '../http/http-context';

export const FALLBACK_CONFIG: AppConfig = {
  appName: 'Angular 22 Demos',
  apiVersion: 'offline',
  environment: 'fallback',
  features: { featureA: true, featureB: true, betaWidgets: false },
};

/** Startup configuration loaded once via provideAppInitializer (video 022). */
@Service()
export class AppConfigStore {
  readonly #http = inject(HttpClient);
  readonly #config = signal<AppConfig>(FALLBACK_CONFIG);
  readonly #loadMs = signal<number | null>(null);
  readonly #source = signal<'server' | 'fallback'>('fallback');

  readonly config = this.#config.asReadonly();
  readonly loadMs = this.#loadMs.asReadonly();
  readonly source = this.#source.asReadonly();
  readonly loadedAt = signal<Date | null>(null);

  isFeatureEnabled(name: string): boolean {
    return this.#config().features[name] ?? false;
  }

  readonly featureList = computed(() => Object.entries(this.#config().features));

  /** Runtime override of a feature flag (used by the guard demo in video 022). */
  setFeature(name: string, enabled: boolean): void {
    this.#config.update((config) => ({
      ...config,
      features: { ...config.features, [name]: enabled },
    }));
  }

  async load(): Promise<void> {
    const started = performance.now();
    try {
      const config = await firstValueFrom(
        this.#http.get<AppConfig>('/api/config', {
          context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
        }),
      );
      this.#config.set(config);
      this.#source.set('server');
    } catch {
      this.#config.set(FALLBACK_CONFIG);
      this.#source.set('fallback');
    } finally {
      this.#loadMs.set(Math.round(performance.now() - started));
      this.loadedAt.set(new Date());
    }
  }
}
