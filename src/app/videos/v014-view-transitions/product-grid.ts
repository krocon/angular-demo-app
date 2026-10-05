import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductStore } from './product.store';

@Component({
  selector: 'app-product-grid',
  imports: [CurrencyPipe, RouterLink],
  template: `
    @if (store.products.isLoading() && !store.list().length) {
      <p class="demo-hint">Loading products…</p>
    }
    <ul class="grid" aria-label="Products">
      @for (product of store.list(); track product.id) {
        <li>
          <a [routerLink]="[product.id]" class="tile" [attr.aria-label]="product.name">
            <span
              class="art"
              [style.background]="product.color"
              [style.view-transition-name]="'product-' + product.id"
              aria-hidden="true"
              >{{ product.emoji }}</span
            >
            <span class="name">{{ product.name }}</span>
            <span class="price">{{ product.price | currency: 'EUR' }}</span>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .grid {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .tile {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
      text-decoration: none;
    }
    .tile:hover {
      background: var(--mat-sys-surface-container-high);
    }
    .tile:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
    }
    .art {
      display: grid;
      place-items: center;
      aspect-ratio: 4 / 3;
      border-radius: var(--mat-sys-corner-small);
      font-size: 44px;
    }
    .name {
      font: var(--mat-sys-title-small);
    }
    .price {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class ProductGrid {
  readonly store = inject(ProductStore);
}
