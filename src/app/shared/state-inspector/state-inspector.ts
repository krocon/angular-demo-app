import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export type InspectorFlags = Readonly<Record<string, boolean>>;

function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return (
    JSON.stringify(
      value,
      (_key, v: unknown) => {
        if (typeof v === 'function') return '[function]';
        if (v instanceof Date) return v.toISOString();
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return '[circular]';
          seen.add(v);
        }
        return v;
      },
      2,
    ) ?? 'undefined'
  );
}

/** Shows any value as formatted JSON plus optional boolean flags (valid/dirty/touched/pending…). */
@Component({
  selector: 'app-state-inspector',
  imports: [MatCardModule, MatChipsModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (flagList().length) {
          <mat-chip-set [attr.aria-label]="title() + ' flags'">
            @for (flag of flagList(); track flag.name) {
              <mat-chip [highlighted]="flag.value" [class.off]="!flag.value">
                {{ flag.name }}: {{ flag.value }}
              </mat-chip>
            }
          </mat-chip-set>
        }
        <pre tabindex="0" [attr.aria-label]="title() + ' as JSON'">{{ json() }}</pre>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    pre {
      margin: 8px 0 0;
      padding: 12px;
      max-height: 360px;
      overflow: auto;
      background: var(--mat-sys-surface-container-highest);
      border-radius: var(--mat-sys-corner-small);
      font: 12.5px/1.5 var(--app-mono);
    }
    .off {
      opacity: 0.75;
    }
  `,
})
export class StateInspector {
  readonly value = input.required<unknown>();
  readonly title = input('State');
  readonly flags = input<InspectorFlags>({});

  readonly json = computed(() => safeStringify(this.value()));
  readonly flagList = computed(() =>
    Object.entries(this.flags()).map(([name, value]) => ({ name, value })),
  );
}
