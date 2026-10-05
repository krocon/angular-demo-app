import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from './auth.store';
import { SKIP_AUTH } from './http-context';

/** Adds `Authorization: Bearer <token>` from the AuthStore signal unless SKIP_AUTH is set. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  if (!token || req.context.get(SKIP_AUTH)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
