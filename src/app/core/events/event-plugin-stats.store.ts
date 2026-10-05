import { Service, computed, signal } from '@angular/core';

/** Counts the listeners that the custom event plugins currently keep alive (leak check, 027). */
@Service()
export class EventPluginStatsStore {
  readonly #active = signal<Readonly<Record<string, number>>>({});
  readonly active = this.#active.asReadonly();
  readonly total = computed(() => Object.values(this.#active()).reduce((sum, n) => sum + n, 0));

  added(kind: string): void {
    this.#active.update((map) => ({ ...map, [kind]: (map[kind] ?? 0) + 1 }));
  }

  removed(kind: string): void {
    this.#active.update((map) => ({ ...map, [kind]: Math.max(0, (map[kind] ?? 0) - 1) }));
  }
}
