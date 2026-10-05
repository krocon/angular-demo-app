import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductStore } from './product.store';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, MatButtonModule, MatIconModule, RouterLink],
  template: `
    @if (product(); as p) {
      <article class="detail">
        <header
          class="hero"
          [style.background]="p.color"
          [style.view-transition-name]="'product-' + p.id"
        >
          <span aria-hidden="true">{{ p.emoji }}</span>
        </header>
        <h3>{{ p.name }}</h3>
        <p class="price">{{ p.price | currency: 'EUR' }}</p>
        <p>{{ p.description }}</p>
        <a mat-stroked-button routerLink=".."
          ><mat-icon>arrow_back</mat-icon>Back to all products</a
        >
      </article>
    } @else {
      <p class="demo-hint">Product {{ id() }} not found.</p>
      <a mat-stroked-button routerLink="..">Back</a>
    }
  `,
  styles: `
    .hero {
      display: grid;
      place-items: center;
      height: 220px;
      border-radius: var(--mat-sys-corner-large);
      font-size: 96px;
    }
    h3 {
      font: var(--mat-sys-headline-small);
      margin: 16px 0 0;
    }
    .price {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-primary);
    }
  `,
})
export class ProductDetail {
  readonly #store = inject(ProductStore);
  /** Bound from the route param via withComponentInputBinding(). */
  readonly id = input.required({ transform: numberAttribute });
  readonly product = computed(() => this.#store.byId(this.id()));
}
