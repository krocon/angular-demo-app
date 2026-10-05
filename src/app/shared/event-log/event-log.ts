import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export interface LogEntry {
  readonly id: number;
  readonly time: Date;
  readonly message: string;
}

/** A tiny signal-based log buffer (newest first). */
export class EventLogBuffer {
  readonly #entries = signal<readonly LogEntry[]>([]);
  readonly entries = this.#entries.asReadonly();
  #id = 1;
  readonly #max: number;

  constructor(max = 100) {
    this.#max = max;
  }

  log(message: string): void {
    const entry: LogEntry = { id: this.#id++, time: new Date(), message };
    this.#entries.update((list) => [entry, ...list].slice(0, this.#max));
  }

  clear(): void {
    this.#entries.set([]);
  }
}

/** Timestamped event list with a Clear button; announced politely to screen readers. */
@Component({
  selector: 'app-event-log',
  imports: [DatePipe, MatButtonModule],
  template: `
    <div class="head">
      <h3>{{ title() }}</h3>
      <button mat-button type="button" (click)="cleared.emit()" [disabled]="!entries().length">
        Clear
      </button>
    </div>
    <ol aria-live="polite" [attr.aria-label]="title()">
      @for (entry of entries(); track entry.id) {
        <li>
          <time>{{ entry.time | date: 'HH:mm:ss.SSS' }}</time>
          <span>{{ entry.message }}</span>
        </li>
      } @empty {
        <li class="empty">No events yet.</li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container-low);
      padding: 8px 12px;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h3 {
      margin: 0;
      font: var(--mat-sys-title-small);
    }
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 240px;
      overflow: auto;
      font: 12.5px/1.6 var(--app-mono);
    }
    li {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      overflow-wrap: anywhere;
    }
    time {
      color: var(--mat-sys-on-surface-variant);
      flex: none;
    }
    .empty {
      color: var(--mat-sys-on-surface-variant);
      border: none;
    }
  `,
})
export class EventLog {
  readonly entries = input.required<readonly LogEntry[]>();
  readonly title = input('Event log');
  readonly cleared = output<void>();
}
