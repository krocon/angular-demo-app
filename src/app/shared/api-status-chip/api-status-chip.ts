import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiStatus } from '../../core/catalog/video.model';

export const API_STATUS_INFO: Record<ApiStatus, { label: string; tooltip: string }> = {
  stable: { label: 'Stable', tooltip: 'Public, stable API – safe for production.' },
  'developer-preview': {
    label: 'Developer Preview',
    tooltip: 'Fully functional, but the API may still change before it becomes stable.',
  },
  experimental: {
    label: 'Experimental',
    tooltip: 'Early API – may change or be removed. Try it, but be careful in production.',
  },
};

@Component({
  selector: 'app-api-status-chip',
  imports: [MatTooltipModule],
  host: { '[class]': 'status()' },
  template: `<span
    class="chip"
    [matTooltip]="info().tooltip"
    tabindex="0"
    [attr.aria-label]="'API status: ' + info().label + '. ' + info().tooltip"
    ><span class="dot" aria-hidden="true"></span>{{ info().label }}</span
  >`,
  styles: `
    :host {
      display: inline-flex;
      --chip-color: var(--app-status-stable);
    }
    :host(.developer-preview) {
      --chip-color: var(--app-status-preview);
    }
    :host(.experimental) {
      --chip-color: var(--app-status-experimental);
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: var(--mat-sys-corner-full);
      border: 1px solid var(--chip-color);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-label-medium);
      white-space: nowrap;
    }
    .chip:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 2px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--chip-color);
    }
  `,
})
export class ApiStatusChip {
  readonly status = input.required<ApiStatus>();
  readonly info = computed(() => API_STATUS_INFO[this.status()]);
}
