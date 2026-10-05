import { DOCUMENT, Injectable, inject } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';
import { EventPluginStatsStore } from './event-plugin-stats.store';

const PATTERN = /^([\w-]+)\.(debounce|throttle)\.(\d+)$/;

export interface ParsedTimingEvent {
  readonly event: string;
  readonly mode: 'debounce' | 'throttle';
  readonly ms: number;
}

export function parseTimingEvent(eventName: string): ParsedTimingEvent | null {
  const match = PATTERN.exec(eventName);
  if (!match) {
    return null;
  }
  return { event: match[1] ?? '', mode: match[2] as 'debounce' | 'throttle', ms: Number(match[3]) };
}

/**
 * Supports `(<event>.debounce.<ms>)`, e.g. `(input.debounce.500)="search($event)"`.
 * The handler runs once the event has been quiet for <ms>. The returned function removes the DOM
 * listener and clears a pending timer – always return a cleanup!
 */
@Injectable()
export class DebounceEventPlugin extends EventManagerPlugin {
  readonly #stats = inject(EventPluginStatsStore);

  constructor() {
    super(inject(DOCUMENT));
  }

  override supports(eventName: string): boolean {
    return parseTimingEvent(eventName)?.mode === 'debounce';
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: (event: Event) => void,
  ): () => void {
    const { event, ms } = parseTimingEvent(eventName) as ParsedTimingEvent;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const listener = (e: Event): void => {
      clearTimeout(timer);
      timer = setTimeout(() => handler(e), ms);
    };
    element.addEventListener(event, listener);
    this.#stats.added('debounce');
    return () => {
      clearTimeout(timer);
      element.removeEventListener(event, listener);
      this.#stats.removed('debounce');
    };
  }
}

/** Supports `(<event>.throttle.<ms>)` – the handler runs at most once per <ms> (leading edge). */
@Injectable()
export class ThrottleEventPlugin extends EventManagerPlugin {
  readonly #stats = inject(EventPluginStatsStore);

  constructor() {
    super(inject(DOCUMENT));
  }

  override supports(eventName: string): boolean {
    return parseTimingEvent(eventName)?.mode === 'throttle';
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: (event: Event) => void,
  ): () => void {
    const { event, ms } = parseTimingEvent(eventName) as ParsedTimingEvent;
    let last = Number.NEGATIVE_INFINITY;
    const listener = (e: Event): void => {
      const now = performance.now();
      if (now - last >= ms) {
        last = now;
        handler(e);
      }
    };
    element.addEventListener(event, listener);
    this.#stats.added('throttle');
    return () => {
      element.removeEventListener(event, listener);
      this.#stats.removed('throttle');
    };
  }
}
