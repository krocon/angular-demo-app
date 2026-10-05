import { HttpInterceptorFn } from '@angular/common/http';

/** Route-level interceptor: only requests made from this feature get the header. */
export const featureHeaderInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-Feature': 'interceptors-demo' } }));
