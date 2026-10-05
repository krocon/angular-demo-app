import {
  provideHttpClient,
  withInterceptors,
  withRequestsMadeViaParent,
} from '@angular/common/http';
import { Routes } from '@angular/router';
import { featureHeaderInterceptor } from './feature-header.interceptor';
import { HttpInterceptorsPage } from './http-interceptors.page';

export const routes: Routes = [
  {
    path: '',
    component: HttpInterceptorsPage,
    providers: [
      // A feature-scoped HttpClient: runs its own interceptor first, then hands the request to the
      // parent (root) HttpClient – so auth, logging, loading, error and the fake backend still run.
      provideHttpClient(withInterceptors([featureHeaderInterceptor]), withRequestsMadeViaParent()),
    ],
  },
];
