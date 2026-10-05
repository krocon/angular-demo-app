import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog } from '../../shared/event-log/event-log';
import { DeferLog } from './defer-log';
import { SNIPPETS } from './defer.snippets';
import { HeavyChart } from './heavy-chart';
import { HelpContent } from './help-content';
import { ReportPanel } from './report-panel';
import { RichTextEditor } from './rich-text-editor';

/**
 * Video 016 – @defer. The four imported components are only used inside @defer blocks,
 * so the compiler moves each of them into its own lazy chunk.
 */
@Component({
  selector: 'app-defer-page',
  imports: [
    DemoPage,
    EventLog,
    HeavyChart,
    HelpContent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    ReportPanel,
    RichTextEditor,
  ],
  providers: [DeferLog],
  templateUrl: './defer.page.html',
  styleUrl: './defer.page.scss',
})
export class DeferPage {
  readonly log = inject(DeferLog);
  readonly snippets = SNIPPETS;
  readonly showReport = signal(false);
}
