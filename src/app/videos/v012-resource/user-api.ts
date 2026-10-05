import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../core/fake-backend/fake-db';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';

export interface UserQuery {
  q: string;
  page: number;
  pageSize: number;
}

export interface UserPage {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

/** Errors are rendered inline by the demo – skip the global snackbar. */
export const INLINE_ERRORS = () => new HttpContext().set(SKIP_ERROR_HANDLING, true);

export const toParams = (query: UserQuery) =>
  new HttpParams({ fromObject: { q: query.q, page: query.page, pageSize: query.pageSize } });

/** Turns an Observable into a Promise that is cancelled through an AbortSignal. */
export function abortable<T>(source: Observable<T>, abortSignal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let last: T | undefined;
    const sub = source.subscribe({
      next: (value) => (last = value),
      error: reject,
      complete: () => resolve(last as T),
    });
    abortSignal.addEventListener('abort', () => {
      sub.unsubscribe(); // → the fake backend logs the request as "cancelled"
      reject(abortSignal.reason);
    });
  });
}

@Injectable({ providedIn: 'root' })
export class UserApi {
  readonly #http = inject(HttpClient);

  list(query: UserQuery): Observable<UserPage> {
    return this.#http.get<UserPage>('/api/users', {
      params: toParams(query),
      context: INLINE_ERRORS(),
    });
  }

  /** Writes go through HttpClient – resources are for reading. */
  create(user: Pick<User, 'name' | 'email'>): Observable<User> {
    return this.#http.post<User>('/api/users', user, { context: INLINE_ERRORS() });
  }
}
