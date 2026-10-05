import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { EventPluginStatsStore } from '../../core/events/event-plugin-stats.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { BEFORE_AFTER, SNIPPETS } from './event-manager-plugins.snippets';
import { LeakProbe } from './leak-probe';

export const DEBOUNCE_OPTIONS = [200, 500, 1000] as const;

/** Video 027 – Event manager plugins: write once, use everywhere. */
@Component({
  selector: 'app-event-manager-plugins-page',
  imports: [
    DemoPage,
    EventLog,
    LeakProbe,
    MatButtonModule,
    MatSlideToggleModule,
    MatSliderModule,
    MetricTile,
  ],
  templateUrl: './event-manager-plugins.page.html',
  styleUrl: './event-manager-plugins.page.scss',
})
export class EventManagerPluginsPage {
  readonly stats = inject(EventPluginStatsStore);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly options = DEBOUNCE_OPTIONS;
  readonly log = new EventLogBuffer();

  readonly plainCalls = signal(0);
  readonly debouncedCalls = signal(0);
  readonly debouncedValue = signal('');
  readonly variantIndex = signal(1);
  readonly variantCalls = signal(0);
  readonly showProbe = signal(true);

  readonly labelFor = (index: number): string => `${DEBOUNCE_OPTIONS[index] ?? ''}`;

  onPlain(): void {
    this.plainCalls.update((n) => n + 1);
  }

  onDebounced(event: Event): void {
    this.debouncedCalls.update((n) => n + 1);
    this.debouncedValue.set((event.target as HTMLInputElement).value);
  }

  onVariant(): void {
    this.variantCalls.update((n) => n + 1);
  }

  onKey(name: string, event: Event): void {
    if (name === 'control.k') {
      event.preventDefault();
    }
    this.log.log(`(keydown.${name}) fired`);
  }
}
