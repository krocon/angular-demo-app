import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DeferLog } from './defer-log';

/** A tiny markdown-ish editor, only loaded on interaction. */
@Component({
  selector: 'app-rich-text-editor',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="toolbar" role="toolbar" aria-label="Formatting">
      <button mat-icon-button type="button" (click)="wrap('**')" aria-label="Bold">
        <mat-icon>format_bold</mat-icon>
      </button>
      <button mat-icon-button type="button" (click)="wrap('_')" aria-label="Italic">
        <mat-icon>format_italic</mat-icon>
      </button>
      <button mat-icon-button type="button" (click)="wrap('\`')" aria-label="Code">
        <mat-icon>code</mat-icon>
      </button>
    </div>
    <textarea
      #area
      rows="5"
      aria-label="Editor"
      [value]="text()"
      (input)="text.set(area.value)"
    ></textarea>
    <p class="demo-hint">{{ words() }} words · {{ text().length }} characters</p>
  `,
  styles: `
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border: 1px solid var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-small);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-body-large);
    }
  `,
})
export class RichTextEditor {
  readonly text = signal('Deferred components load **only when needed**.');
  readonly words = computed(() => this.text().trim().split(/\s+/).filter(Boolean).length);
  readonly area = viewChild.required<ElementRef<HTMLTextAreaElement>>('area');

  constructor() {
    inject(DeferLog).loaded('RichTextEditor (on interaction)');
  }

  wrap(marker: string): void {
    const el = this.area().nativeElement;
    const { selectionStart: start, selectionEnd: end } = el;
    const value = this.text();
    this.text.set(
      value.slice(0, start) + marker + value.slice(start, end) + marker + value.slice(end),
    );
  }
}
