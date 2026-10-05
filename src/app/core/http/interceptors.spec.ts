import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Notifier } from '../notify/notifier';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from './auth.store';
import { errorInterceptor } from './error.interceptor';
import { SKIP_AUTH, SKIP_ERROR_HANDLING, SKIP_LOADING } from './http-context';
import { HttpTraceStore } from './http-trace.store';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingStore } from './loading.store';
import { loggingInterceptor } from './logging.interceptor';

describe('HTTP interceptors', () => {
  let notifyResult = false;
  const notifier = { open: vi.fn(() => Promise.resolve(notifyResult)) };

  beforeEach(() => {
    notifyResult = false;
    notifier.open.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            authInterceptor,
            loggingInterceptor,
            loadingInterceptor,
            errorInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
        { provide: Notifier, useValue: notifier },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const http = () => TestBed.inject(HttpClient);
  const backend = () => TestBed.inject(HttpTestingController);

  describe('authInterceptor', () => {
    it('adds the bearer token from the AuthStore', () => {
      http().get('/api/me').subscribe();
      const req = backend().expectOne('/api/me');
      expect(req.request.headers.get('Authorization')).toBe('Bearer demo-token-22');
      req.flush({});
    });

    it('skips the token with SKIP_AUTH or when logged out', () => {
      http()
        .get('/a', { context: new HttpContext().set(SKIP_AUTH, true) })
        .subscribe();
      expect(backend().expectOne('/a').request.headers.has('Authorization')).toBe(false);
      TestBed.inject(AuthStore).logout();
      http().get('/b').subscribe();
      expect(backend().expectOne('/b').request.headers.has('Authorization')).toBe(false);
      backend()
        .match(() => true)
        .forEach((r) => r.flush({}));
    });
  });

  describe('loadingInterceptor', () => {
    it('counts active requests', () => {
      const loading = TestBed.inject(LoadingStore);
      http().get('/a').subscribe();
      http().get('/b').subscribe();
      expect(loading.active()).toBe(2);
      backend().expectOne('/a').flush({});
      expect(loading.isLoading()).toBe(true);
      backend().expectOne('/b').flush({});
      expect(loading.isLoading()).toBe(false);
    });

    it('ignores requests with SKIP_LOADING', () => {
      http()
        .get('/silent', { context: new HttpContext().set(SKIP_LOADING, true) })
        .subscribe();
      expect(TestBed.inject(LoadingStore).active()).toBe(0);
      backend().expectOne('/silent').flush({});
    });
  });

  describe('loggingInterceptor', () => {
    it('traces status and cancellation', () => {
      const trace = TestBed.inject(HttpTraceStore);
      http().get('/ok').subscribe();
      backend().expectOne('/ok').flush({});
      expect(trace.entries()[0]).toMatchObject({ method: 'GET', url: '/ok', outcome: '200' });
      const sub = http().get('/slow').subscribe();
      sub.unsubscribe();
      expect(trace.entries()[0]).toMatchObject({ url: '/slow', outcome: 'cancelled' });
      backend().expectOne('/slow');
    });
  });

  describe('errorInterceptor', () => {
    it('logs out and notifies on 401', async () => {
      const result = firstValueFrom(http().get('/api/me')).catch((e: unknown) => e);
      backend().expectOne('/api/me').flush({}, { status: 401, statusText: 'Unauthorized' });
      expect(((await result) as HttpErrorResponse).status).toBe(401);
      expect(TestBed.inject(AuthStore).isLoggedIn()).toBe(false);
      expect(notifier.open).toHaveBeenCalledWith(
        expect.stringContaining('Session expired'),
        'OK',
        4000,
      );
    });

    it('retries a 5xx request when "Retry" is clicked', async () => {
      notifyResult = true;
      const result = firstValueFrom(http().get<{ ok: boolean }>('/api/x'));
      backend().expectOne('/api/x').flush({}, { status: 500, statusText: 'Server Error' });
      await Promise.resolve();
      await Promise.resolve();
      backend().expectOne('/api/x').flush({ ok: true });
      expect(await result).toEqual({ ok: true });
    });

    it('re-throws a 5xx error when the snackbar is dismissed', async () => {
      const result = firstValueFrom(http().get('/api/x')).catch((e: unknown) => e);
      backend().expectOne('/api/x').flush({}, { status: 503, statusText: 'Unavailable' });
      expect(((await result) as HttpErrorResponse).status).toBe(503);
    });

    it('stays out of the way with SKIP_ERROR_HANDLING', async () => {
      const context = new HttpContext().set(SKIP_ERROR_HANDLING, true);
      const result = firstValueFrom(http().get('/api/x', { context })).catch((e: unknown) => e);
      backend().expectOne('/api/x').flush({}, { status: 500, statusText: 'Server Error' });
      expect(((await result) as HttpErrorResponse).status).toBe(500);
      expect(notifier.open).not.toHaveBeenCalled();
    });
  });
});
