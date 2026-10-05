import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { BUILD_INFO } from '../../core/generated/build-info.generated';
import { CodeViewer } from '../../shared/code-viewer/code-viewer';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { SNIPPETS } from './bundle-optimization.snippets';
import { LIBRARY_SIZES, LOCALES, intlSamples } from './intl-formats';

export interface LoadResult {
  readonly ms: number;
  readonly chunk: string;
  readonly primes: number;
}

/** Video 023 – Bundle analysis & optimization: measure first, then optimize. */
@Component({
  selector: 'app-bundle-optimization-page',
  imports: [
    CodeViewer,
    DemoPage,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatStepperModule,
    MetricTile,
  ],
  templateUrl: './bundle-optimization.page.html',
  styleUrl: './bundle-optimization.page.scss',
})
export class BundleOptimizationPage {
  readonly snippets = SNIPPETS;
  readonly budgets = BUILD_INFO.budgets;
  readonly scripts = BUILD_INFO.scripts;
  readonly locales = LOCALES;
  readonly libraries = LIBRARY_SIZES;

  readonly locale = signal<string>('de-DE');
  readonly now = signal(new Date());
  readonly samples = computed(() => intlSamples(this.locale(), this.now()));

  readonly loading = signal(false);
  readonly loaded = signal<LoadResult | null>(null);

  async loadHeavyModule(): Promise<void> {
    this.loading.set(true);
    const started = performance.now();
    // A dynamic import() becomes its own lazy chunk – fetched only when this runs.
    const heavy = await import('./heavy-module');
    const primes = heavy.primesUpTo(200_000).length;
    this.loaded.set({
      ms: Math.round(performance.now() - started),
      chunk: heavy.CHUNK_URL.split('/').pop() ?? heavy.CHUNK_URL,
      primes,
    });
    this.loading.set(false);
  }
}
