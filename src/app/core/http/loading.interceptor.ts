import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SKIP_LOADING } from './http-context';
import { LoadingStore } from './loading.store';

/** Drives the global progress bar through an active-request counter signal. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }
  const loading = inject(LoadingStore);
  loading.begin();
  return next(req).pipe(finalize(() => loading.end()));
};
