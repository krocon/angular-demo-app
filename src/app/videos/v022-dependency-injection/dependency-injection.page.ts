import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppConfigStore } from '../../core/config/app-config.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog } from '../../shared/event-log/event-log';
import { SNIPPETS } from './dependency-injection.snippets';
import { LifecycleLogStore } from './lifecycle-log.store';

/** Video 022 – Dependency injection & service lifecycle. */
@Component({
  selector: 'app-dependency-injection-page',
  imports: [
    DatePipe,
    DemoPage,
    EventLog,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './dependency-injection.page.html',
  styleUrl: './dependency-injection.page.scss',
})
export class DependencyInjectionPage {
  readonly config = inject(AppConfigStore);
  readonly log = inject(LifecycleLogStore);
  readonly snippets = SNIPPETS;
}
