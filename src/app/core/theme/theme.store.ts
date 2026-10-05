import { DOCUMENT, Service, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = 'ng22-demos.theme';

function readStoredMode(): ThemeMode {
  try {
    const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Light / dark / system as a signal; an effect writes `color-scheme` onto <html>. */
@Service()
export class ThemeStore {
  readonly #document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(readStoredMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      this.#document.documentElement.style.colorScheme = mode === 'system' ? 'light dark' : mode;
      try {
        globalThis.localStorage?.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // storage unavailable (private mode) – the in-memory signal still works
      }
    });
  }

  cycle(): void {
    const order: readonly ThemeMode[] = ['light', 'dark', 'system'];
    this.mode.update((m) => order[(order.indexOf(m) + 1) % order.length] ?? 'system');
  }
}
