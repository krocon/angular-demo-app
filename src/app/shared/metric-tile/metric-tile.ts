import { Component, input } from '@angular/core';

/** Small KPI tile: label, value, unit and an optional trend hint. */
@Component({
  selector: 'app-metric-tile',
  template: `
    <span class="label">{{ label() }}</span>
    <span class="value"
      >{{ value() }}
      @if (unit()) {
        <small>{{ unit() }}</small>
      }
    </span>
    @if (trend()) {
      <span class="trend">{{ trend() }}</span>
    }
  `,
  host: { role: 'group', '[attr.aria-label]': 'label() + ": " + value() + " " + unit()' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 12px 16px;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container);
      min-width: 120px;
    }
    .label {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .value {
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
      font-variant-numeric: tabular-nums;
    }
    small {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
    }
    .trend {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-primary);
    }
  `,
})
export class MetricTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly trend = input('');
}
