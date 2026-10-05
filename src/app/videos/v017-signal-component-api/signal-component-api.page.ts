import { Component, effect, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { BEFORE_AFTER, SNIPPETS } from './signal-component-api.snippets';
import { TagDirective, UserCard } from './user-card';

export const MIGRATIONS = [
  'ng generate @angular/core:signal-input-migration',
  'ng generate @angular/core:output-migration',
  'ng generate @angular/core:signal-queries-migration',
  'ng generate @angular/core:signals   # all three at once',
];

/** Video 017 – Signal component API: a parent/child playground. */
@Component({
  selector: 'app-signal-component-api-page',
  imports: [
    DemoPage,
    EventLog,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    TagDirective,
    UserCard,
  ],
  templateUrl: './signal-component-api.page.html',
  styleUrl: './signal-component-api.page.scss',
})
export class SignalComponentApiPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly migrations = MIGRATIONS;
  readonly log = new EventLogBuffer();

  readonly name = signal('Ada Lovelace');
  readonly highlighted = signal(false);
  readonly rating = signal(3);
  readonly tags = signal(['signals', 'zoneless']);
  readonly card = viewChild.required(UserCard);

  constructor() {
    // effect() only for side effects – here: logging.
    effect(() => this.log.log(`effect: name="${this.name()}", rating=${this.rating()}`));
  }

  onSelected(name: string): void {
    this.log.log(`output (selected): ${name}`);
  }

  addTag(): void {
    this.tags.update((tags) => [...tags, `tag-${tags.length + 1}`]);
  }

  removeTag(): void {
    this.tags.update((tags) => tags.slice(0, -1));
  }
}
