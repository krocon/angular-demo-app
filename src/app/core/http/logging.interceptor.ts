import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { HttpTraceStore } from './http-trace.store';

/** Measures the client-side duration of every request and writes it to the HttpTraceStore. */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const trace = inject(HttpTraceStore);
  const started = performance.now();
  let outcome = 'cancelled';
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          outcome = String(event.status);
        }
      },
      error: (error: unknown) => {
        outcome = error instanceof HttpErrorResponse ? `error ${error.status}` : 'error';
      },
    }),
    finalize(() =>
      trace.add({
        time: Date.now(),
        method: req.method,
        url: req.urlWithParams,
        outcome,
        durationMs: Math.round(performance.now() - started),
      }),
    ),
  );
};
