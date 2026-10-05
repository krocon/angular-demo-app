import { Component, computed, input, model, numberAttribute, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type Limit = 'min' | 'max';

/** Component under test: inputs, a model() and an output. */
@Component({
  selector: 'app-quantity-stepper',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      mat-icon-button
      type="button"
      (click)="decrement()"
      [disabled]="atMin()"
      aria-label="Decrease"
    >
      <mat-icon>remove</mat-icon>
    </button>
    <output aria-live="polite" data-testid="value">{{ value() }}</output>
    <button
      mat-icon-button
      type="button"
      (click)="increment()"
      [disabled]="atMax()"
      aria-label="Increase"
    >
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    output {
      min-width: 3ch;
      text-align: center;
      font: var(--mat-sys-title-large);
    }
  `,
})
export class QuantityStepper {
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(10, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly value = model(0);
  readonly limitReached = output<Limit>();

  readonly atMin = computed(() => this.value() <= this.min());
  readonly atMax = computed(() => this.value() >= this.max());

  increment(): void {
    this.#set(this.value() + this.step());
  }

  decrement(): void {
    this.#set(this.value() - this.step());
  }

  #set(next: number): void {
    const clamped = Math.min(this.max(), Math.max(this.min(), next));
    this.value.set(clamped);
    if (clamped === this.max()) this.limitReached.emit('max');
    if (clamped === this.min()) this.limitReached.emit('min');
  }
}
