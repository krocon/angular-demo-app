import { Component, computed, inject } from '@angular/core';
import { DeferLog } from './defer-log';

const POINTS = 4000;

/** A "heavy" SVG chart with thousands of data points – a good candidate for @defer. */
@Component({
  selector: 'app-heavy-chart',
  template: `
    <svg
      viewBox="0 0 800 200"
      role="img"
      [attr.aria-label]="'Line chart with ' + count + ' points'"
    >
      <path [attr.d]="area()" class="area" />
      <path [attr.d]="line()" class="line" />
    </svg>
    <p class="demo-hint">{{ count }} data points, rendered as one SVG path.</p>
  `,
  styles: `
    svg {
      width: 100%;
      height: 200px;
      display: block;
    }
    .line {
      fill: none;
      stroke: var(--mat-sys-primary);
      stroke-width: 1.5;
    }
    .area {
      fill: var(--mat-sys-primary-container);
      opacity: 0.6;
    }
  `,
})
export class HeavyChart {
  readonly count = POINTS;
  readonly #data = Array.from(
    { length: POINTS },
    (_, i) => 100 + 60 * Math.sin(i / 90) + 25 * Math.sin(i / 13) + 10 * Math.cos(i / 3),
  );
  readonly line = computed(() =>
    this.#data
      .map(
        (y, i) =>
          `${i ? 'L' : 'M'}${((i / (POINTS - 1)) * 800).toFixed(1)},${(200 - y).toFixed(1)}`,
      )
      .join(''),
  );
  readonly area = computed(() => `${this.line()}L800,200L0,200Z`);

  constructor() {
    inject(DeferLog).loaded('HeavyChart (on viewport)');
  }
}
