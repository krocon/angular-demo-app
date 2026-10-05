import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppConfigStore } from '../../core/config/app-config.store';
import { LifecycleLogStore } from './lifecycle-log.store';

/** Functional guard with inject(): reads a feature flag from the startup config. */
export const featureFlagGuard: CanActivateFn = (route) => {
  const flag = String(route.data['flag'] ?? '');
  if (inject(AppConfigStore).isFeatureEnabled(flag)) {
    return true;
  }
  inject(LifecycleLogStore).log(`guard: "${flag}" is disabled – navigation blocked`);
  return inject(Router).createUrlTree(['/videos/022-dependency-injection']);
};
