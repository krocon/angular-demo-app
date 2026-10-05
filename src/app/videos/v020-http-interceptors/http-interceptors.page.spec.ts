import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore } from '../../core/fake-backend/network-settings.store';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { authInterceptor } from '../../core/http/auth.interceptor';
import { AuthStore } from '../../core/http/auth.store';
import { errorInterceptor } from '../../core/http/error.interceptor';
import { loadingInterceptor } from '../../core/http/loading.interceptor';
import { LoadingStore } from '../../core/http/loading.store';
import { loggingInterceptor } from '../../core/http/logging.interceptor';
import { Notifier } from '../../core/notify/notifier';
import { HttpInterceptorsPage } from './http-interceptors.page';
import { routes } from './http-interceptors.routes';

describe('HttpInterceptorsPage (020)', () => {
  const notifier = { open: vi.fn(() => Promise.resolve(false)) };

  beforeEach(() => {
    notifier.open.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'demo', children: routes }]),
        provideHttpClient(
          withInterceptors([
            authInterceptor,
            loggingInterceptor,
            loadingInterceptor,
            errorInterceptor,
            fakeBackendInterceptor,
          ]),
        ),
        { provide: Notifier, useValue: notifier },
      ],
    });
    TestBed.inject(NetworkSettingsStore).latencyMs.set(0);
  });

  async function setup() {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/demo');
    const page = harness.fixture.debugElement.query(By.directive(HttpInterceptorsPage))
      .componentInstance as HttpInterceptorsPage;
    return { harness, page, log: TestBed.inject(RequestLogStore) };
  }

  it('runs the route interceptor first and the root chain afterwards', async () => {
    const { page, log } = await setup();
    await page.getOk();
    expect(log.entries()[0]?.headers).toEqual({
      'X-Feature': 'interceptors-demo',
      Authorization: 'Bearer demo-token-22',
    });
    expect(page.results()[0]).toMatchObject({ ok: true, label: 'GET /api/me' });
    expect(page.trace.entries()[0]?.outcome).toBe('200');
  });

  it('SKIP_AUTH omits the token', async () => {
    const { page, log } = await setup();
    await page.getWithoutToken();
    expect(log.entries()[0]?.headers['Authorization']).toBeUndefined();
    expect(page.headerList(log.entries()[0]!.headers)).toBe('X-Feature: interceptors-demo');
    expect(page.headerList({})).toBe('—');
  });

  it('401 clears the token, 500 asks the notifier for a retry', async () => {
    const { page } = await setup();
    await page.get401();
    expect(TestBed.inject(AuthStore).isLoggedIn()).toBe(false);
    expect(page.results()[0]).toMatchObject({ ok: false, detail: 'HTTP 401' });
    await page.get500();
    expect(notifier.open).toHaveBeenCalledWith('Server error (500)', 'Retry', 5000);
    expect(page.results()[0]?.detail).toBe('HTTP 500');
    page.toggleLogin();
    expect(TestBed.inject(AuthStore).isLoggedIn()).toBe(true);
    page.toggleLogin();
    expect(TestBed.inject(AuthStore).isLoggedIn()).toBe(false);
  });

  it('SKIP_LOADING keeps the progress counter at 0', async () => {
    TestBed.inject(NetworkSettingsStore).latencyMs.set(20);
    const { page } = await setup();
    const loading = TestBed.inject(LoadingStore);
    const silent = page.getSilently();
    expect(loading.active()).toBe(0);
    await silent;
    const normal = page.getOk();
    expect(loading.active()).toBe(1);
    await normal;
    expect(loading.active()).toBe(0);
  });
});
