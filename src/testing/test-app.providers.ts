import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  EnvironmentProviders,
  Provider,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { routes } from '../app/app.routes';
import { DebounceEventPlugin, ThrottleEventPlugin } from '../app/core/events/timing-event.plugins';
import { fakeBackendInterceptor } from '../app/core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore, RANDOM } from '../app/core/fake-backend/network-settings.store';
import { authInterceptor } from '../app/core/http/auth.interceptor';
import { errorInterceptor } from '../app/core/http/error.interceptor';
import { loadingInterceptor } from '../app/core/http/loading.interceptor';
import { loggingInterceptor } from '../app/core/http/logging.interceptor';
import { AppTitleStrategy } from '../app/core/title.strategy';

/**
 * Application-like providers for integration tests: real routes, real interceptors and the
 * in-memory backend with 0 ms latency and a deterministic random source.
 */
export function provideTestApp(
  options: { latencyMs?: number } = {},
): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        loadingInterceptor,
        errorInterceptor,
        fakeBackendInterceptor,
      ]),
    ),
    { provide: RANDOM, useValue: () => 0.99 },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: EVENT_MANAGER_PLUGINS, useClass: DebounceEventPlugin, multi: true },
    { provide: EVENT_MANAGER_PLUGINS, useClass: ThrottleEventPlugin, multi: true },
    provideEnvironmentInitializer(() =>
      inject(NetworkSettingsStore).latencyMs.set(options.latencyMs ?? 0),
    ),
  ];
}
