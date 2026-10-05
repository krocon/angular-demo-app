import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['app.config.ts', 'provideHttpClient(withInterceptors([...])) – order matters.'],
  ['http-interceptors.routes.ts', 'Route-level HttpClient + withRequestsMadeViaParent().'],
  'feature-header.interceptor.ts',
  'core/http/auth.interceptor.ts',
  'core/http/error.interceptor.ts',
  'core/http/loading.interceptor.ts',
  'core/http/logging.interceptor.ts',
  ['core/http/http-context.ts', 'HttpContextToken flags per request.'],
  'http-interceptors.page.ts',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'auth.interceptor.class.ts',
    `
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    if (!token || req.headers.has('X-Skip-Auth')) {   // magic header as a flag …
      return next.handle(req.clone({ headers: req.headers.delete('X-Skip-Auth') }));
    }
    return next.handle(req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }));
  }
}

// app.module.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
],
`,
    'Class interceptors, HTTP_INTERCEPTORS multi providers and header hacks as flags.',
  ),
  after: snippet(
    'auth.interceptor.ts',
    `
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  if (!token || req.context.get(SKIP_AUTH)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }));
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
`,
    'Functional interceptor + typed HttpContextToken.',
  ),
};
