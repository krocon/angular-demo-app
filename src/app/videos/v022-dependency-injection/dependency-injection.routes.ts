import { inject, provideEnvironmentInitializer } from '@angular/core';
import { Routes } from '@angular/router';
import { DependencyInjectionPage } from './dependency-injection.page';
import { featureFlagGuard } from './feature-flag.guard';
import { FEATURE_NAME, FeatureSessionService } from './feature-session.service';
import { FeatureView } from './feature-view';
import { LifecycleLogStore } from './lifecycle-log.store';

function featureProviders(name: string) {
  return [
    { provide: FEATURE_NAME, useValue: name },
    FeatureSessionService,
    // Runs once when this route's EnvironmentInjector is created.
    provideEnvironmentInitializer(() =>
      inject(LifecycleLogStore).log(`environment initializer: injector for ${name} created`),
    ),
  ];
}

export const routes: Routes = [
  {
    path: '',
    component: DependencyInjectionPage,
    children: [
      { path: 'feature-a', component: FeatureView, providers: featureProviders('Feature A') },
      {
        path: 'feature-b',
        component: FeatureView,
        canActivate: [featureFlagGuard],
        data: { flag: 'featureB' },
        providers: featureProviders('Feature B'),
      },
    ],
  },
];
