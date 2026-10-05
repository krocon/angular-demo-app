import { Service, computed, signal } from '@angular/core';

/** Counts in-flight HTTP requests for the global progress bar. */
@Service()
export class LoadingStore {
  readonly #active = signal(0);
  readonly active = this.#active.asReadonly();
  readonly isLoading = computed(() => this.#active() > 0);

  begin(): void {
    this.#active.update((n) => n + 1);
  }

  end(): void {
    this.#active.update((n) => Math.max(0, n - 1));
  }
}
