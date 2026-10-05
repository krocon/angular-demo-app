import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FakeDb, TAKEN_USERNAMES, User, createFakeDb } from './fake-db';
import { NetworkSettingsStore, RANDOM } from './network-settings.store';
import { RequestLogStore } from './request-log.store';

/** Holds the mutable in-memory database (one per application). */
@Service()
export class FakeDbStore {
  db: FakeDb = createFakeDb();
  reset(): void {
    this.db = createFakeDb();
  }
}

interface FakeResult {
  readonly status: number;
  readonly body: unknown;
}

type Handler = (req: HttpRequest<unknown>, params: string[], db: FakeDb) => FakeResult;

const ok = (body: unknown, status = 200): FakeResult => ({ status, body });
const fail = (status: number, message: string): FakeResult => ({ status, body: { message } });

const ROUTES: readonly [method: string, pattern: RegExp, handler: Handler][] = [
  ['GET', /^\/api\/config$/, (_r, _p, db) => ok(db.config)],
  [
    'GET',
    /^\/api\/me$/,
    (req) =>
      req.headers.has('Authorization')
        ? ok({ name: 'Ada Lovelace', token: req.headers.get('Authorization') })
        : fail(401, 'Missing bearer token'),
  ],
  [
    'GET',
    /^\/api\/users$/,
    (req, _p, db) => {
      const q = (req.params.get('q') ?? '').trim().toLowerCase();
      const page = Math.max(1, Number(req.params.get('page') ?? 1));
      const pageSize = Math.min(100, Math.max(1, Number(req.params.get('pageSize') ?? 10)));
      const filtered = q
        ? db.users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q))
        : db.users;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return ok({ items, total: filtered.length, page, pageSize });
    },
  ],
  [
    'GET',
    /^\/api\/users\/(\d+)$/,
    (_r, [id], db) => {
      const user = db.users.find((u) => u.id === Number(id));
      return user ? ok(user) : fail(404, `User ${id} not found`);
    },
  ],
  [
    'POST',
    /^\/api\/users$/,
    (req, _p, db) => {
      const body = (req.body ?? {}) as Partial<User>;
      if (!body.name || !body.email) {
        return fail(400, 'name and email are required');
      }
      const user: User = {
        id: Math.max(0, ...db.users.map((u) => u.id)) + 1,
        name: body.name,
        email: body.email,
        role: body.role ?? 'Developer',
        companyId: body.companyId ?? 1,
      };
      db.users = [user, ...db.users];
      return ok(user, 201);
    },
  ],
  [
    'GET',
    /^\/api\/companies\/(\d+)$/,
    (_r, [id], db) => {
      const company = db.companies.find((c) => c.id === Number(id));
      return company ? ok(company) : fail(404, `Company ${id} not found`);
    },
  ],
  [
    'GET',
    /^\/api\/usernames\/([^/]+)\/available$/,
    (_r, [name]) =>
      ok({ available: !TAKEN_USERNAMES.includes(decodeURIComponent(name ?? '').toLowerCase()) }),
  ],
  [
    'PUT',
    /^\/api\/profile$/,
    (req, _p, db) => {
      db.profile = { ...db.profile, ...(req.body as object) };
      return ok({ ...db.profile, savedAt: new Date().toISOString() });
    },
  ],
  ['GET', /^\/api\/products$/, (_r, _p, db) => ok(db.products)],
  [
    'GET',
    /^\/api\/products\/(\d+)$/,
    (_r, [id], db) => {
      const product = db.products.find((p) => p.id === Number(id));
      return product ? ok(product) : fail(404, `Product ${id} not found`);
    },
  ],
  ['GET', /^\/api\/status\/(\d{3})$/, (_r, [code]) => fail(Number(code), `Simulated ${code}`)],
  [
    'GET',
    /^\/api\/ticker$/,
    () => {
      const tick = Math.floor(Date.now() / 1000);
      return ok(
        ['NG', 'RX', 'TS'].map((symbol, i) => ({
          symbol,
          price: Math.round((100 + 20 * Math.sin(tick / (3 + i)) + i * 15) * 100) / 100,
          ts: tick,
        })),
      );
    },
  ],
];

/** Resolves a request against the in-memory API (exported for unit tests). */
export function resolveFakeRequest(req: HttpRequest<unknown>, db: FakeDb): FakeResult {
  const path = req.url.split('?')[0] ?? req.url;
  for (const [method, pattern, handler] of ROUTES) {
    const match = method === req.method ? pattern.exec(path) : null;
    if (match) {
      return handler(req, match.slice(1), db);
    }
  }
  return fail(404, `No fake route for ${req.method} ${path}`);
}

/**
 * Answers every `/api/**` request from memory. Registered as the LAST interceptor so that
 * auth, logging, loading and error interceptors run before it. Latency, error rate and offline
 * mode come from the NetworkSettingsStore; cancellation clears the timer and logs "cancelled".
 */
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const settings = inject(NetworkSettingsStore);
  const log = inject(RequestLogStore);
  const db = inject(FakeDbStore);
  const random = inject(RANDOM);

  return new Observable<HttpEvent<unknown>>((subscriber) => {
    const id = log.start(req);
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      let result: FakeResult;
      if (settings.offline()) {
        result = { status: 0, body: { message: 'Offline (simulated)' } };
      } else if (random() * 100 < settings.errorRate()) {
        result = fail(503, 'Simulated failure (Network panel error rate)');
      } else {
        result = resolveFakeRequest(req, db.db);
      }
      log.finish(id, result.status);
      if (result.status >= 200 && result.status < 300) {
        subscriber.next(
          new HttpResponse({ status: result.status, body: result.body, url: req.urlWithParams }),
        );
        subscriber.complete();
      } else {
        subscriber.error(
          new HttpErrorResponse({
            status: result.status,
            statusText: result.status === 0 ? 'Unknown Error' : 'Error',
            error: result.body,
            url: req.urlWithParams,
          }),
        );
      }
    }, settings.latencyMs());

    return () => {
      if (!settled) {
        clearTimeout(timer);
        log.cancel(id);
      }
    };
  });
};
