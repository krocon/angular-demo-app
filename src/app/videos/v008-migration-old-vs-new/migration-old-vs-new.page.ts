import { Component, computed, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { lineCount } from '../../shared/code-viewer/code-snippet';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { BEFORE_AFTER, SNIPPETS } from './migration-old-vs-new.snippets';
import { ReactiveOrderForm } from './reactive-order-form';
import { SignalOrderForm } from './signal-order-form';
import { SOURCES } from './sources.generated';

/** Video 008 – Migration: the same order form with Reactive Forms and with Signal Forms. */
@Component({
  selector: 'app-migration-old-vs-new-page',
  imports: [DemoPage, MatIconModule, MetricTile, ReactiveOrderForm, SignalOrderForm],
  templateUrl: './migration-old-vs-new.page.html',
  styleUrl: './migration-old-vs-new.page.scss',
})
export class MigrationOldVsNewPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;

  readonly reactive = viewChild.required(ReactiveOrderForm);
  readonly signals = viewChild.required(SignalOrderForm);

  readonly reactiveLines = lineCount(SOURCES['reactive-order-form.ts'] ?? '');
  readonly signalLines = lineCount(SOURCES['signal-order-form.ts'] ?? '');

  readonly sameTotal = computed(() => this.reactive().total() === this.signals().total());
}
