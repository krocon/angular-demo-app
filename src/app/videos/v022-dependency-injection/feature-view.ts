import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FeatureSessionService } from './feature-session.service';

@Component({
  selector: 'app-feature-view',
  imports: [DatePipe],
  template: `
    <h4>{{ session.feature }}</h4>
    <dl>
      <dt>Service instance</dt>
      <dd>#{{ session.instanceId }}</dd>
      <dt>Started</dt>
      <dd>{{ session.startedAt | date: 'HH:mm:ss' }}</dd>
      <dt>Alive for</dt>
      <dd>{{ session.secondsAlive() }} s</dd>
    </dl>
  `,
  styles: `
    :host {
      display: block;
      padding: 16px;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface);
      border: 1px solid var(--mat-sys-outline-variant);
    }
    h4 {
      margin: 0 0 8px;
      font: var(--mat-sys-title-medium);
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 12px;
      margin: 0;
    }
    dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class FeatureView {
  readonly session = inject(FeatureSessionService);
}
