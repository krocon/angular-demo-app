import { ResourceStreamItem, Signal, signal } from '@angular/core';

export interface Tick {
  readonly symbol: string;
  readonly price: number;
  readonly at: number;
}

/** Simulates a WebSocket: pushes a new tick every `intervalMs` until closed. */
export class FakeTickerSocket {
  #timer: ReturnType<typeof setInterval> | undefined;
  #seq = 0;
  onmessage: ((tick: Tick) => void) | null = null;

  constructor(
    readonly symbol: string,
    intervalMs = 800,
  ) {
    this.#timer = setInterval(() => {
      this.#seq++;
      const price = Math.round((100 + 10 * Math.sin(this.#seq / 3) + this.#seq * 0.1) * 100) / 100;
      this.onmessage?.({ symbol, price, at: this.#seq });
    }, intervalMs);
  }

  close(): void {
    clearInterval(this.#timer);
    this.#timer = undefined;
  }

  get closed(): boolean {
    return this.#timer === undefined;
  }
}

/** Bridges the socket into a resource `stream`: a signal of stream items, closed on abort. */
export function tickerStream(
  symbol: string,
  abortSignal: AbortSignal,
): Signal<ResourceStreamItem<Tick[]>> {
  const items = signal<ResourceStreamItem<Tick[]>>({ value: [] });
  const socket = new FakeTickerSocket(symbol);
  socket.onmessage = (tick) =>
    items.update((current) => ({
      value: ['value' in current ? current.value : [], [tick]].flat().slice(-8),
    }));
  abortSignal.addEventListener('abort', () => socket.close());
  return items;
}
