import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

/** Shared timer helper: setInterval with automatic cleanup via DestroyRef. */
function every(ms: number, fn: () => void): void {
  const id = setInterval(fn, ms);
  inject(DestroyRef).onDestroy(() => clearInterval(id));
}

/**
 * ❌ A plain class field changed by setInterval. Without zone.js nobody tells Angular that
 * something changed – the view stays stale until a template event (click) marks it dirty.
 */
@Component({
  selector: 'app-plain-counter',
  imports: [MatButtonModule],
  template: `
    <h3>Plain field + setInterval</h3>
    <p class="value" aria-live="off">{{ count }}</p>
    <p class="demo-hint">Template checks of this component: {{ checks() }}</p>
    <button mat-stroked-button type="button" (click)="(0)">Click (template event)</button>
  `,
  host: { class: 'demo-card counter' },
  styles: `
    .value {
      margin: 8px 0;
      font: var(--mat-sys-display-medium);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class PlainCounter {
  readonly running = input(true);
  count = 0;
  #checks = 0;

  constructor() {
    every(1000, () => {
      if (this.running()) this.count++;
    });
  }

  /** Called from the template on every check – a deliberate demo side effect. */
  checks(): number {
    return ++this.#checks;
  }
}

/** ✅ A signal changed by setInterval: Angular knows exactly which view to refresh. */
@Component({
  selector: 'app-signal-counter',
  imports: [MatButtonModule],
  template: `
    <h3>Signal + setInterval</h3>
    <p class="value" aria-live="off">{{ count() }}</p>
    <p class="demo-hint">Template checks of this component: {{ checks() }}</p>
    <button mat-stroked-button type="button" (click)="(0)">Click (template event)</button>
  `,
  host: { class: 'demo-card counter' },
  styles: `
    .value {
      margin: 8px 0;
      font: var(--mat-sys-display-medium);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class SignalCounter {
  readonly running = input(true);
  readonly count = signal(0);
  #checks = 0;

  constructor() {
    every(1000, () => {
      if (this.running()) this.count.update((n) => n + 1);
    });
  }

  checks(): number {
    return ++this.#checks;
  }
}
