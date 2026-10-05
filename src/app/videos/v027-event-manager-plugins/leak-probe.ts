import { Component, signal } from '@angular/core';

/** Registers three plugin listeners; destroying it must bring the counter back down. */
@Component({
  selector: 'app-leak-probe',
  template: `
    <input aria-label="Probe A" (input.debounce.300)="hits.set(hits() + 1)" />
    <input aria-label="Probe B" (keyup.debounce.300)="hits.set(hits() + 1)" />
    <div
      class="box"
      tabindex="0"
      aria-label="Probe scroll box"
      (scroll.throttle.100)="hits.set(hits() + 1)"
    >
      <div class="tall">scroll me</div>
    </div>
    <span class="demo-hint">probe handler calls: {{ hits() }}</span>
  `,
  styles: `
    :host {
      display: grid;
      gap: 6px;
      padding: 8px;
      border: 1px dashed var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-small);
    }
    input {
      padding: 4px 8px;
    }
    .box {
      height: 60px;
      overflow: auto;
      border: 1px solid var(--mat-sys-outline-variant);
    }
    .tall {
      height: 200px;
      padding: 4px;
    }
  `,
})
export class LeakProbe {
  readonly hits = signal(0);
}
