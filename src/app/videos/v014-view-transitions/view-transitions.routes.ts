import { Routes } from '@angular/router';
import { ProductDetail } from './product-detail';
import { ProductGrid } from './product-grid';
import { ViewTransitionsPage } from './view-transitions.page';

export const routes: Routes = [
  {
    path: '',
    component: ViewTransitionsPage,
    children: [
      { path: '', component: ProductGrid },
      { path: ':id', component: ProductDetail },
    ],
  },
];
