import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { interval, map, startWith } from 'rxjs';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { BEFORE_AFTER, SNIPPETS } from './let-syntax.snippets';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const TAX_RATE = 0.19;
export const FREE_SHIPPING_FROM = 100;

/** Video 015 – Clean templates with @let: name a value once, read it everywhere. */
@Component({
  selector: 'app-let-syntax-page',
  imports: [AsyncPipe, CurrencyPipe, DemoPage, MatButtonModule, MatIconModule],
  templateUrl: './let-syntax.page.html',
  styleUrl: './let-syntax.page.scss',
})
export class LetSyntaxPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly taxRate = TAX_RATE;
  readonly freeShippingFrom = FREE_SHIPPING_FROM;

  readonly cart = signal<CartItem[]>([
    { id: 1, name: 'Signal Lamp', price: 24.9, quantity: 1 },
    { id: 2, name: 'Deferred Rocket', price: 39.5, quantity: 1 },
    { id: 3, name: 'Track Shoes', price: 12, quantity: 2 },
  ]);

  /** An Observable – @let + async pipe replaces the old *ngIf="… as x" trick. */
  readonly price$ = interval(1000).pipe(
    startWith(0),
    map((tick) => Math.round((100 + 8 * Math.sin(tick / 2)) * 100) / 100),
  );

  setQuantity(id: number, value: string): void {
    const quantity = Math.max(0, Math.min(99, Number(value) || 0));
    this.cart.update((items) => items.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  change(id: number, delta: number): void {
    const item = this.cart().find((i) => i.id === id);
    if (item) this.setQuantity(id, String(item.quantity + delta));
  }
}
