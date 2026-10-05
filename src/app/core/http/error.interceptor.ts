import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Notifier } from '../notify/notifier';
import { AuthStore } from './auth.store';
import { SKIP_ERROR_HANDLING } from './http-context';

export const RETRY_WINDOW_MS = 5000;

/**
 * Central error handling:
 * - 401 → "Session expired" snackbar and the token is cleared.
 * - 5xx → snackbar with a "Retry" action; clicking it re-sends the request, otherwise the error
 *   is re-thrown once the snackbar is dismissed.
 * Requests that render their own errors set SKIP_ERROR_HANDLING.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }
  const notifier = inject(Notifier);
  const auth = inject(AuthStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      if (error.status === 401) {
        auth.logout();
        void notifier.open('Session expired – please log in again.', 'OK', 4000);
        return throwError(() => error);
      }
      if (error.status >= 500) {
        return from(notifier.open(`Server error (${error.status})`, 'Retry', RETRY_WINDOW_MS)).pipe(
          switchMap((retry) => (retry ? next(req) : throwError(() => error))),
        );
      }
      return throwError(() => error);
    }),
  );
};
