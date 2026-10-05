import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Notifier } from '../../core/notify/notifier';
import { CodeLanguage, lineCount } from './code-snippet';
import { highlight } from './highlight';

/** Read-only code block with a file-name badge, line count and copy button. */
@Component({
  selector: 'app-code-viewer',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <figure class="viewer">
      <figcaption class="bar">
        <span class="file">{{ file() }}</span>
        <span class="lines">{{ lines() }} lines</span>
        <button
          mat-icon-button
          type="button"
          (click)="copy()"
          [attr.aria-label]="'Copy ' + file()"
          matTooltip="Copy to clipboard"
        >
          <mat-icon>content_copy</mat-icon>
        </button>
      </figcaption>
      @if (note(); as note) {
        <p class="note">{{ note }}</p>
      }
      <pre
        tabindex="0"
        [attr.aria-label]="'Source code of ' + file()"
      ><code>@for (token of tokens(); track $index) {<span [class]="token.type">{{ token.text }}</span>}</code></pre>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .viewer {
      margin: 0;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container-highest);
      overflow: hidden;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 4px 4px 12px;
      background: var(--mat-sys-surface-container-high);
      font: var(--mat-sys-label-large);
    }
    .file {
      font-family: var(--app-mono);
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      padding: 2px 8px;
      border-radius: var(--mat-sys-corner-small);
      overflow-wrap: anywhere;
    }
    .lines {
      margin-inline-start: auto;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
    }
    .note {
      margin: 0;
      padding: 8px 12px 0;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    pre {
      margin: 0;
      padding: 12px;
      overflow: auto;
      max-height: 560px;
      font: 13px/1.55 var(--app-mono);
      tab-size: 2;
    }
    pre:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: -2px;
    }
    .comment {
      color: var(--mat-sys-outline);
      font-style: italic;
    }
    .string {
      color: var(--mat-sys-tertiary);
    }
    .keyword {
      color: var(--mat-sys-primary);
      font-weight: 600;
    }
    .decorator,
    .tag {
      color: var(--mat-sys-secondary);
      font-weight: 600;
    }
    .attr,
    .number {
      color: var(--mat-sys-error);
    }
  `,
})
export class CodeViewer {
  readonly #clipboard = inject(Clipboard);
  readonly #notifier = inject(Notifier);

  readonly code = input.required<string>();
  readonly file = input('snippet.ts');
  readonly language = input<CodeLanguage>('ts');
  readonly note = input<string | undefined>(undefined);

  readonly tokens = computed(() => highlight(this.code(), this.language()));
  readonly lines = computed(() => lineCount(this.code()));

  copy(): void {
    const copied = this.#clipboard.copy(this.code());
    void this.#notifier.open(copied ? 'Copied' : 'Copy failed', undefined, 1500);
  }
}
