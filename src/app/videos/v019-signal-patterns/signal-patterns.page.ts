import {
  Component,
  computed,
  debounced,
  effect,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { asyncScheduler, throttleTime } from 'rxjs';
import { ApiStatusChip } from '../../shared/api-status-chip/api-status-chip';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { PatternAdvisor } from './pattern-advisor';
import { SNIPPETS } from './signal-patterns.snippets';
import { tickerStream } from './ticker-socket';

export const CATALOG: Readonly<Record<string, readonly string[]>> = {
  Fruits: ['Apple', 'Banana', 'Cherry'],
  Vegetables: ['Carrot', 'Leek', 'Pepper'],
  Nuts: ['Almond', 'Cashew', 'Walnut'],
};

export const ACCENT_KEY = 'ng22-demos.accent';
export const DELAY_MS = 500;

interface Point {
  x: number;
  y: number;
}
const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

function readAccent(): string {
  try {
    return globalThis.localStorage?.getItem(ACCENT_KEY) ?? 'violet';
  } catch {
    return 'violet';
  }
}

/** Video 019 – Signal & resource patterns cheat sheet. */
@Component({
  selector: 'app-signal-patterns-page',
  imports: [
    ApiStatusChip,
    DemoPage,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MetricTile,
    PatternAdvisor,
  ],
  templateUrl: './signal-patterns.page.html',
  styleUrl: './signal-patterns.page.scss',
})
export class SignalPatternsPage {
  readonly snippets = SNIPPETS;
  readonly categories = Object.keys(CATALOG);

  // computed – pure derivation
  readonly price = signal(19.99);
  readonly quantity = signal(3);
  readonly total = computed(() => Math.round(this.price() * this.quantity() * 100) / 100);

  // linkedSignal – derived but writable; resets when the source changes
  readonly category = signal('Fruits');
  readonly options = computed(() => CATALOG[this.category()] ?? []);
  readonly selected = linkedSignal(() => this.options()[0] ?? '');

  // equal – skip downstream work when the value is "the same"
  readonly point = signal<Point>({ x: 1, y: 2 });
  readonly plainCopy = computed(() => ({ ...this.point() }));
  readonly equalCopy = computed(() => ({ ...this.point() }), { equal: samePoint });
  #plainRuns = 0;
  #equalRuns = 0;
  readonly plainDownstream = computed(() => (this.plainCopy(), ++this.#plainRuns));
  readonly equalDownstream = computed(() => (this.equalCopy(), ++this.#equalRuns));

  // effect – side effects only: persist a setting
  readonly accent = signal(readAccent());

  // resource with `stream` – a simulated WebSocket
  readonly streaming = signal(true);
  readonly ticker = resource({
    params: () => (this.streaming() ? 'NG' : undefined),
    stream: async ({ params, abortSignal }) => tickerStream(params, abortSignal),
  });
  readonly lastTick = computed(() =>
    this.ticker.hasValue() ? this.ticker.value().at(-1) : undefined,
  );

  // debounced (experimental) vs. throttleTime (RxJS)
  readonly query = signal('');
  readonly debouncedQuery = debounced(() => this.query(), DELAY_MS);
  readonly throttledQuery = toSignal(
    toObservable(this.query).pipe(
      throttleTime(DELAY_MS, asyncScheduler, { leading: true, trailing: true }),
    ),
    { initialValue: '' },
  );
  readonly keystrokes = signal(0);
  readonly debouncedUpdates = signal(0);
  readonly throttledUpdates = signal(0);

  constructor() {
    effect(() => {
      const accent = this.accent();
      try {
        globalThis.localStorage?.setItem(ACCENT_KEY, accent);
      } catch {
        // storage unavailable – the signal still works in memory
      }
    });
    effect(() => {
      this.debouncedQuery.value();
      this.debouncedUpdates.update((n) => n + 1);
    });
    effect(() => {
      this.throttledQuery();
      this.throttledUpdates.update((n) => n + 1);
    });
  }

  plainRuns(): number {
    return this.#plainRuns;
  }

  equalRuns(): number {
    return this.#equalRuns;
  }

  setSamePoint(): void {
    this.point.set({ ...this.point() });
  }

  movePoint(): void {
    this.point.update((p) => ({ x: p.x + 1, y: p.y }));
  }

  type(value: string): void {
    this.query.set(value);
    this.keystrokes.update((n) => n + 1);
  }
}
