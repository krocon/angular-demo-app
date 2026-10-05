import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'dependency-injection.routes.ts',
    'Route providers + provideEnvironmentInitializer per route injector.',
  ],
  ['feature-session.service.ts', 'A route-scoped service with DestroyRef cleanup.'],
  ['feature-flag.guard.ts', 'Functional guard with inject().'],
  ['app.config.ts', 'provideAppInitializer(...) and withAutoCleanupInjectors().'],
  'core/config/app-config.store.ts',
  'lifecycle-log.store.ts',
]);
