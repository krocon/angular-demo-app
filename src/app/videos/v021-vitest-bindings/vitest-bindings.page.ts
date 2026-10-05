import { Component, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { CodeViewer } from '../../shared/code-viewer/code-viewer';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { Limit, QuantityStepper } from './quantity-stepper';
import { SOURCES } from './sources.generated';
import { parseSpec } from './spec-parser';
import { UserBadge } from './user-badge';
import { BEFORE_AFTER, SNIPPETS } from './vitest-bindings.snippets';

/** Video 021 – Component tests with Vitest and the bindings API. */
@Component({
  selector: 'app-vitest-bindings-page',
  imports: [
    CodeViewer,
    DemoPage,
    EventLog,
    MatButtonToggleModule,
    MatExpansionModule,
    QuantityStepper,
    UserBadge,
  ],
  templateUrl: './vitest-bindings.page.html',
  styleUrl: './vitest-bindings.page.scss',
})
export class VitestBindingsPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly log = new EventLogBuffer();

  readonly quantity = signal(2);
  readonly max = signal(5);
  readonly userId = signal(1);

  /** The real spec files of this folder, parsed into a "test explorer". */
  readonly specs = [
    { file: 'quantity-stepper.spec.ts', ...parseSpec(SOURCES['quantity-stepper.spec.ts'] ?? '') },
    { file: 'user-badge.spec.ts', ...parseSpec(SOURCES['user-badge.spec.ts'] ?? '') },
  ];

  onLimit(limit: Limit): void {
    this.log.log(`limitReached: ${limit}`);
  }
}
