import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withAutoCleanupInjectors,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { AppConfigStore } from './core/config/app-config.store';
import { DebounceEventPlugin, ThrottleEventPlugin } from './core/events/timing-event.plugins';
import { fakeBackendInterceptor } from './core/fake-backend/fake-backend.interceptor';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { loggingInterceptor } from './core/http/logging.interceptor';
import { AppTitleStrategy } from './core/title.strategy';
import { ViewTransitionSettingsStore } from './core/view-transitions/view-transition-settings.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless is the default since v21 – set explicitly so video 011 can point at it.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: (info) => inject(ViewTransitionSettingsStore).onCreated(info),
      }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // 22.2: destroy route injectors (route `providers`) once their route is inactive.
      withAutoCleanupInjectors(),
    ),
    provideHttpClient(
      withFetch(),
      // Order matters: the fake backend answers last, after auth/logging/loading/error.
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        loadingInterceptor,
        errorInterceptor,
        fakeBackendInterceptor,
      ]),
    ),
    provideAppInitializer(() => inject(AppConfigStore).load()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: EVENT_MANAGER_PLUGINS, useClass: DebounceEventPlugin, multi: true },
    { provide: EVENT_MANAGER_PLUGINS, useClass: ThrottleEventPlugin, multi: true },
    provideEnvironmentInitializer(() =>
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined'),
    ),
  ],
};
