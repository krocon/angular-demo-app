import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MatIconModule } from '@angular/material/icon';

/**
 * A 1–5 star rating that works with `[formField]` because it implements FormValueControl<number>:
 * `value` is a model(), everything else (disabled, touched, invalid, errors) are plain inputs that
 * Signal Forms fills automatically. Keyboard: arrows, Home/End. ARIA: radiogroup.
 */
@Component({
  selector: 'app-star-rating',
  imports: [MatIconModule],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-invalid]': 'showErrors()',
    '[class.disabled]': 'disabled()',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'touch.emit()',
    '(mouseleave)': 'hover.set(0)',
  },
  template: `
    <span class="label" aria-hidden="true">{{ label() }}</span>
    <span class="stars">
      @for (star of starList(); track star) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="value() === star"
          [attr.aria-label]="star + (star === 1 ? ' star' : ' stars')"
          [tabindex]="star === focusStar() ? 0 : -1"
          [disabled]="disabled()"
          [class.filled]="star <= (hover() || value())"
          (click)="select(star)"
          (mouseenter)="hover.set(disabled() ? 0 : star)"
        >
          <mat-icon aria-hidden="true">{{
            star <= (hover() || value()) ? 'star' : 'star_outline'
          }}</mat-icon>
        </button>
      }
    </span>
    @if (showErrors()) {
      <span class="error" role="alert">{{ errors()[0]?.message }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
    }
    .label {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
    }
    .stars {
      display: inline-flex;
    }
    button {
      border: none;
      background: none;
      padding: 4px;
      cursor: pointer;
      color: var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-full);
    }
    button.filled {
      color: var(--app-status-preview);
    }
    button:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .error {
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
    }
  `,
})
export class StarRating implements FormValueControl<number> {
  // The only required member of FormValueControl:
  readonly value = model(0);
  // Optional state inputs – bound automatically by [formField]:
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  // Tell Signal Forms when the user is done (marks the field as touched):
  readonly touch = output<void>();

  readonly stars = input(5);
  readonly label = input('Rating');
  readonly hover = signal(0);

  readonly starList = computed(() => Array.from({ length: this.stars() }, (_, i) => i + 1));
  readonly focusStar = computed(() => Math.max(1, this.value()));
  readonly showErrors = computed(() => this.touched() && this.invalid());

  select(star: number): void {
    if (!this.disabled()) {
      this.value.set(star);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const current = this.value();
    const next: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      Home: 1,
      End: this.stars(),
    };
    const target = next[event.key];
    if (target === undefined) return;
    event.preventDefault();
    this.value.set(Math.min(this.stars(), Math.max(1, target)));
    const host = event.currentTarget as HTMLElement | null;
    queueMicrotask(() => host?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus());
  }
}
