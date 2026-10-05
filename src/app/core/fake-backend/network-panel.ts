import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { NetworkSettingsStore } from './network-settings.store';
import { RequestLogStore } from './request-log.store';

/** Bottom sheet with the fake backend's network conditions. */
@Component({
  selector: 'app-network-panel',
  imports: [MatButtonModule, MatSliderModule, MatSlideToggleModule],
  template: `
    <h2 id="network-title">Fake backend · network</h2>
    <p class="demo-hint">
      All <code>/api/**</code> requests are answered in memory by an interceptor. Tune the
      conditions to see loading, error and cancellation states in the demos.
    </p>
    <label class="row" for="latency">
      <span>Latency</span><strong>{{ settings.latencyMs() }} ms</strong>
    </label>
    <mat-slider min="0" max="3000" step="50" discrete>
      <input
        id="latency"
        matSliderThumb
        [value]="settings.latencyMs()"
        (valueChange)="settings.latencyMs.set($event)"
      />
    </mat-slider>
    <label class="row" for="error-rate">
      <span>Error rate</span><strong>{{ settings.errorRate() }} %</strong>
    </label>
    <mat-slider min="0" max="100" step="5" discrete>
      <input
        id="error-rate"
        matSliderThumb
        [value]="settings.errorRate()"
        (valueChange)="settings.errorRate.set($event)"
      />
    </mat-slider>
    <mat-slide-toggle
      [checked]="settings.offline()"
      (change)="settings.offline.set($event.checked)"
    >
      Offline
    </mat-slide-toggle>
    <div class="actions">
      <span class="demo-hint">{{ log.total() }} requests logged</span>
      <button mat-button type="button" (click)="settings.reset()">Reset</button>
      <button mat-flat-button type="button" (click)="ref.dismiss()">Done</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 8px 4px 16px;
    }
    h2 {
      font: var(--mat-sys-title-large);
      margin: 0 0 8px;
    }
    mat-slider {
      display: block;
      width: calc(100% - 16px);
      margin-inline: 8px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      font: var(--mat-sys-label-large);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
    }
    .actions span {
      margin-inline-end: auto;
    }
  `,
})
export class NetworkPanel {
  readonly settings = inject(NetworkSettingsStore);
  readonly log = inject(RequestLogStore);
  readonly ref = inject(MatBottomSheetRef<NetworkPanel>);
}
