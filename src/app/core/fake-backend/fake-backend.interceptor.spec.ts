import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  FakeDbStore,
  fakeBackendInterceptor,
  resolveFakeRequest,
} from './fake-backend.interceptor';
import { createFakeDb, mulberry32 } from './fake-db';
import { NetworkSettingsStore, RANDOM } from './network-settings.store';
import { MAX_LOG_ENTRIES, RequestLogStore } from './request-log.store';

describe('fakeBackendInterceptor', () => {
  let random = 0.99;

  beforeEach(() => {
    vi.useFakeTimers();
    random = 0.99;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([fakeBackendInterceptor])),
        { provide: RANDOM, useValue: () => random },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  const http = () => TestBed.inject(HttpClient);
  const settings = () => TestBed.inject(NetworkSettingsStore);
  const log = () => TestBed.inject(RequestLogStore);

  it('answers after the configured latency', async () => {
    settings().latencyMs.set(300);
    let result: unknown;
    http()
      .get('/api/products/1')
      .subscribe((r) => (result = r));
    await vi.advanceTimersByTimeAsync(299);
    expect(result).toBeUndefined();
    expect(log().pendingCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(result).toMatchObject({ id: 1, name: 'Signal Lamp' });
    expect(log().entries()[0]).toMatchObject({ status: 200, durationMs: 300, cancelled: false });
  });

  it('fails with 503 according to the error rate (deterministic random)', async () => {
    settings().latencyMs.set(0);
    settings().errorRate.set(50);
    random = 0.2;
    const failing = firstValueFrom(http().get('/api/products')).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(0);
    expect(((await failing) as HttpErrorResponse).status).toBe(503);

    random = 0.7;
    const passing = firstValueFrom(http().get('/api/products'));
    await vi.advanceTimersByTimeAsync(0);
    expect(await passing).toHaveLength(24);
  });

  it('returns status 0 while offline', async () => {
    settings().latencyMs.set(0);
    settings().offline.set(true);
    const result = firstValueFrom(http().get('/api/config')).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(0);
    expect(((await result) as HttpErrorResponse).status).toBe(0);
  });

  it('clears the timer and logs "cancelled" when the request is unsubscribed', async () => {
    settings().latencyMs.set(1000);
    const sub = http().get('/api/users').subscribe();
    await vi.advanceTimersByTimeAsync(400);
    sub.unsubscribe();
    expect(log().entries()[0]).toMatchObject({ cancelled: true, status: null, durationMs: 400 });
    await vi.advanceTimersByTimeAsync(2000);
    expect(log().entries()[0]?.status).toBeNull();
    expect(log().cancelledCount()).toBe(1);
  });

  it('records request headers in the log', async () => {
    settings().latencyMs.set(0);
    const done = firstValueFrom(http().get('/api/me', { headers: { Authorization: 'Bearer x' } }));
    await vi.advanceTimersByTimeAsync(0);
    await done;
    expect(log().entries()[0]?.headers).toEqual({ Authorization: 'Bearer x' });
  });

  it('provides a resettable in-memory database', () => {
    const store = TestBed.inject(FakeDbStore);
    store.db.users = [];
    store.reset();
    expect(store.db.users).toHaveLength(480);
  });

  it('caps the request log', () => {
    const store = log();
    const req = new HttpRequest('GET', '/api/x');
    for (let i = 0; i < MAX_LOG_ENTRIES + 10; i++) store.start(req);
    expect(store.total()).toBe(MAX_LOG_ENTRIES);
    store.clear();
    expect(store.total()).toBe(0);
  });
});

describe('resolveFakeRequest', () => {
  const db = createFakeDb();
  const get = (url: string) => resolveFakeRequest(new HttpRequest('GET', url), db);

  it('paginates and searches users', () => {
    const page = get('/api/users').body as { items: unknown[]; total: number };
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(480);
    const params = new HttpParams({ fromObject: { q: 'lovelace', page: 1, pageSize: 5 } });
    const search = resolveFakeRequest(new HttpRequest('GET', '/api/users', null, { params }), db)
      .body as { items: { name: string }[]; pageSize: number };
    expect(search.pageSize).toBe(5);
    expect(search.items.every((u) => u.name.includes('Lovelace'))).toBe(true);
  });

  it('checks username availability', () => {
    expect(get('/api/usernames/admin/available').body).toEqual({ available: false });
    expect(get('/api/usernames/ada/available').body).toEqual({ available: true });
  });

  it('returns 404s and status codes', () => {
    expect(get('/api/users/99999').status).toBe(404);
    expect(get('/api/nope').status).toBe(404);
    expect(get('/api/status/500').status).toBe(500);
    expect(get('/api/me').status).toBe(401);
  });

  it('creates users with 201', () => {
    const local = createFakeDb();
    const res = resolveFakeRequest(
      new HttpRequest('POST', '/api/users', { name: 'New', email: 'n@example.com' }),
      local,
    );
    expect(res.status).toBe(201);
    expect(local.users[0]?.name).toBe('New');
    expect(resolveFakeRequest(new HttpRequest('POST', '/api/users', {}), local).status).toBe(400);
  });

  it('saves the profile and serves the ticker', () => {
    const local = createFakeDb();
    const res = resolveFakeRequest(new HttpRequest('PUT', '/api/profile', { bio: 'x' }), local);
    expect(res.body).toMatchObject({ bio: 'x', displayName: 'Ada Lovelace' });
    expect(get('/api/ticker').body).toHaveLength(3);
    expect(get('/api/companies/1').status).toBe(200);
  });

  it('generates deterministic seed data', () => {
    expect(createFakeDb().users[0]).toEqual(createFakeDb().users[0]);
    const a = mulberry32(1);
    const b = mulberry32(1);
    expect(a()).toBe(b());
  });
});
