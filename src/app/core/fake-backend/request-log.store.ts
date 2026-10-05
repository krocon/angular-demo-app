import { HttpRequest } from '@angular/common/http';
import { Service, computed, signal } from '@angular/core';

export interface RequestLogEntry {
  readonly id: number;
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly startedAt: number;
  readonly status: number | null;
  readonly durationMs: number | null;
  readonly cancelled: boolean;
}

export const MAX_LOG_ENTRIES = 200;

/** Server-side view of every request that reached the fake backend (newest first). */
@Service()
export class RequestLogStore {
  readonly #entries = signal<readonly RequestLogEntry[]>([]);
  #nextId = 1;

  readonly entries = this.#entries.asReadonly();
  readonly total = computed(() => this.#entries().length);
  readonly cancelledCount = computed(() => this.#entries().filter((e) => e.cancelled).length);
  readonly pendingCount = computed(
    () => this.#entries().filter((e) => e.status === null && !e.cancelled).length,
  );

  start(req: HttpRequest<unknown>, now = Date.now()): number {
    const headers: Record<string, string> = {};
    for (const key of req.headers.keys()) {
      headers[key] = req.headers.get(key) ?? '';
    }
    const entry: RequestLogEntry = {
      id: this.#nextId++,
      method: req.method,
      url: req.urlWithParams,
      headers,
      startedAt: now,
      status: null,
      durationMs: null,
      cancelled: false,
    };
    this.#entries.update((list) => [entry, ...list].slice(0, MAX_LOG_ENTRIES));
    return entry.id;
  }

  finish(id: number, status: number, now = Date.now()): void {
    this.#patch(id, (e) => ({ ...e, status, durationMs: now - e.startedAt }));
  }

  cancel(id: number, now = Date.now()): void {
    this.#patch(id, (e) => ({ ...e, cancelled: true, durationMs: now - e.startedAt }));
  }

  clear(): void {
    this.#entries.set([]);
  }

  #patch(id: number, fn: (entry: RequestLogEntry) => RequestLogEntry): void {
    this.#entries.update((list) => list.map((e) => (e.id === id ? fn(e) : e)));
  }
}
