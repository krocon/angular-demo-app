import { Service, signal } from '@angular/core';

export interface HttpTraceEntry {
  readonly id: number;
  readonly time: number;
  readonly method: string;
  readonly url: string;
  readonly outcome: string;
  readonly durationMs: number;
}

/** Client-side trace written by the logging interceptor (newest first, max 50). */
@Service()
export class HttpTraceStore {
  readonly #entries = signal<readonly HttpTraceEntry[]>([]);
  readonly entries = this.#entries.asReadonly();
  #id = 1;

  add(entry: Omit<HttpTraceEntry, 'id'>): void {
    this.#entries.update((list) => [{ ...entry, id: this.#id++ }, ...list].slice(0, 50));
  }

  clear(): void {
    this.#entries.set([]);
  }
}
