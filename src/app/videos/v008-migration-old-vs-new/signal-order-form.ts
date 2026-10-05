import { CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { INITIAL_ORDER, Order, PRODUCTS, orderTotal } from './order';

/** AFTER: Signal Forms – interface + signal + form() + computed total. */
@Component({
  selector: 'app-signal-order-form',
  imports: [CurrencyPipe, FormField, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <form class="demo-stack" novalidate>
      <mat-form-field appearance="outline">
        <mat-label>Product</mat-label>
        <mat-select [formField]="order.product">
          @for (p of products; track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="pricing">
        <mat-form-field appearance="outline">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" [formField]="order.pricing.quantity" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Unit price</mat-label>
          <input matInput type="number" [formField]="order.pricing.unitPrice" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Discount %</mat-label>
          <input matInput type="number" [formField]="order.pricing.discount" />
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
export class SignalOrderForm {
  readonly products = PRODUCTS;
  readonly subscriptions = 0;

  readonly model = signal<Order>(structuredClone(INITIAL_ORDER));
  readonly order = form(this.model, (path) => {
    required(path.product);
    min(path.pricing.quantity, 1);
    min(path.pricing.unitPrice, 0);
    min(path.pricing.discount, 0);
    max(path.pricing.discount, 100);
  });

  readonly total = computed(() => {
    const { quantity, unitPrice, discount } = this.model().pricing;
    return orderTotal(quantity, unitPrice, discount);
  });
}
