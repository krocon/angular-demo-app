import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { CodeSnippet, lineCount } from '../code-viewer/code-snippet';
import { CodeViewer } from '../code-viewer/code-viewer';

/** "Old way" vs. "New way" side by side (stacked on small screens) with a line diff chip. */
@Component({
  selector: 'app-before-after',
  imports: [CodeViewer, MatChipsModule],
  template: `
    <div class="summary">
      <mat-chip-set aria-label="Line difference">
        <mat-chip [highlighted]="diff() < 0">{{ diffLabel() }}</mat-chip>
      </mat-chip-set>
    </div>
    <div class="grid">
      <section aria-labelledby="before-title">
        <h3 id="before-title">
          Old way <small>({{ beforeLines() }} lines)</small>
        </h3>
        <app-code-viewer
          [code]="before().code"
          [file]="before().file"
          [language]="before().language"
          [note]="before().note"
        />
      </section>
      <section aria-labelledby="after-title">
        <h3 id="after-title">
          New way <small>({{ afterLines() }} lines)</small>
        </h3>
        <app-code-viewer
          [code]="after().code"
          [file]="after().file"
          [language]="after().language"
          [note]="after().note"
        />
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
    }
    h3 {
      font: var(--mat-sys-title-medium);
      margin: 8px 0;
    }
    small {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
    .summary {
      margin-bottom: 8px;
    }
  `,
})
export class BeforeAfter {
  readonly before = input.required<CodeSnippet>();
  readonly after = input.required<CodeSnippet>();

  readonly beforeLines = computed(() => lineCount(this.before().code));
  readonly afterLines = computed(() => lineCount(this.after().code));
  readonly diff = computed(() => this.afterLines() - this.beforeLines());
  readonly diffLabel = computed(() => {
    const diff = this.diff();
    return diff === 0 ? '±0 lines' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)} lines`;
  });
}
