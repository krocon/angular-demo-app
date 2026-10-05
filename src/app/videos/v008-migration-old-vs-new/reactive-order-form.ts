import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { INITIAL_ORDER, PRODUCTS, orderTotal } from './order';

/** BEFORE: Reactive Forms – FormBuilder, nested FormGroup, a subscription for the total. */
@Component({
  selector: 'app-reactive-order-form',
  imports: [CurrencyPipe, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" class="demo-stack">
      <mat-form-field appearance="outline">
        <mat-label>Product</mat-label>
        <mat-select formControlName="product">
          @for (p of products; track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div formGroupName="pricing" class="pricing">
        <mat-form-field appearance="outline">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" formControlName="quantity" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Unit price</mat-label>
          <input matInput type="number" formControlName="unitPrice" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Discount %</mat-label>
          <input matInput type="number" formControlName="discount" />
        </mat-form-field>
      </div>
      <p class="total">
        Total: <strong>{{ total() | currency: 'EUR' }}</strong>
      </p>
    </form>
  `,
  styles: `
    .pricing {
      display: grid;
      gap: 0 8px;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    }
    .total {
      margin: 0 0 8px;
      font: var(--mat-sys-title-medium);
    }
  `,
})
export class ReactiveOrderForm {
  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly products = PRODUCTS;
  readonly subscriptions = 1;

  readonly form = this.#fb.nonNullable.group({
    product: [INITIAL_ORDER.product, Validators.required],
    pricing: this.#fb.nonNullable.group({
      quantity: [INITIAL_ORDER.pricing.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [INITIAL_ORDER.pricing.unitPrice, Validators.min(0)],
      discount: [INITIAL_ORDER.pricing.discount, [Validators.min(0), Validators.max(100)]],
    }),
  });

  readonly total = signal(this.#calculate());

  constructor() {
    // A stream per derived value – and you must not forget the cleanup.
    this.form.controls.pricing.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.total.set(this.#calculate()));
  }

  #calculate(): number {
    const { quantity, unitPrice, discount } = this.form.controls.pricing.getRawValue();
    return orderTotal(Number(quantity), Number(unitPrice), Number(discount));
  }
}
