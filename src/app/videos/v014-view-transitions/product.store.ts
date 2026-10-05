import { httpResource } from '@angular/common/http';
import { Injectable, computed } from '@angular/core';
import { Product } from '../../core/fake-backend/fake-db';

/**
 * Provided by the page, shared by grid and detail. The detail view reads the product
 * synchronously from here – the morph target must exist when the transition snapshots the DOM.
 */
@Injectable()
export class ProductStore {
  readonly products = httpResource<Product[]>(() => '/api/products', { defaultValue: [] });
  readonly list = computed(() => (this.products.hasValue() ? this.products.value() : []));

  byId(id: number): Product | undefined {
    return this.list().find((p) => p.id === id);
  }
}
