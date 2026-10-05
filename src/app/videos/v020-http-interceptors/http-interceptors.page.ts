import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { AuthStore } from '../../core/http/auth.store';
import { SKIP_AUTH, SKIP_LOADING } from '../../core/http/http-context';
import { HttpTraceStore } from '../../core/http/http-trace.store';
import { LoadingStore } from '../../core/http/loading.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { BEFORE_AFTER, SNIPPETS } from './http-interceptors.snippets';

export interface CallResult {
  readonly label: string;
  readonly ok: boolean;
  readonly detail: string;
}

export const CHAIN = [
  'featureHeader (route)',
  'auth',
  'logging',
  'loading',
  'error',
  'fakeBackend',
] as const;

/** Video 020 – HTTP interceptors, HttpContext and error handling. */
@Component({
  selector: 'app-http-interceptors-page',
  imports: [DemoPage, MatButtonModule, MatIconModule],
  templateUrl: './http-interceptors.page.html',
  styleUrl: './http-interceptors.page.scss',
})
export class HttpInterceptorsPage {
  /** The route-level HttpClient (see http-interceptors.routes.ts). */
  readonly #http = inject(HttpClient);
  readonly auth = inject(AuthStore);
  readonly loading = inject(LoadingStore);
  readonly trace = inject(HttpTraceStore);
  readonly #log = inject(RequestLogStore);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly chain = CHAIN;

  readonly results = signal<readonly CallResult[]>([]);
  readonly requests = computed(() => this.#log.entries().slice(0, 8));

  getOk(): Promise<void> {
    return this.#call('GET /api/me', '/api/me');
  }

  get401(): Promise<void> {
    return this.#call('GET 401', '/api/status/401');
  }

  get500(): Promise<void> {
    return this.#call('GET 500 (snackbar → Retry)', '/api/status/500');
  }

  getWithoutToken(): Promise<void> {
    return this.#call(
      'GET without token (SKIP_AUTH)',
      '/api/config',
      new HttpContext().set(SKIP_AUTH, true),
    );
  }

  getSilently(): Promise<void> {
    return this.#call(
      'GET silently (SKIP_LOADING)',
      '/api/products',
      new HttpContext().set(SKIP_LOADING, true),
    );
  }

  toggleLogin(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.logout();
    } else {
      this.auth.login();
    }
  }

  headerList(headers: Readonly<Record<string, string>>): string {
    const entries = Object.entries(headers);
    return entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join(' · ') : '—';
  }

  async #call(label: string, url: string, context?: HttpContext): Promise<void> {
    let result: CallResult;
    try {
      const body = await firstValueFrom(this.#http.get<unknown>(url, { context }));
      result = { label, ok: true, detail: JSON.stringify(body).slice(0, 80) };
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      result = { label, ok: false, detail: `HTTP ${status}` };
    }
    this.results.update((list) => [result, ...list].slice(0, 6));
  }
}
