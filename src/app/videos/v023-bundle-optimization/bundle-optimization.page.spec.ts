import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BundleOptimizationPage } from './bundle-optimization.page';
import { primesUpTo } from './heavy-module';
import { intlSamples } from './intl-formats';

describe('BundleOptimizationPage (023)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('formats with Intl for different locales', () => {
    const date = new Date(Date.UTC(2026, 9, 5, 12));
    const de = intlSamples('de-DE', date);
    expect(de.find((s) => s.api === 'Intl.RelativeTimeFormat')?.output).toBe('vor 3 Tagen');
    expect(de.find((s) => s.api === 'Intl.ListFormat')?.output).toBe(
      'Signals, Resources und Forms',
    );
    const en = intlSamples('en-US', date);
    expect(en.find((s) => s.api === 'Intl.NumberFormat (compact)')?.output).toBe('2.5M');
    expect(en.find((s) => s.api === 'Intl.PluralRules')?.output).toContain('1 → one');
  });

  it('shows the real budgets and loads a module on demand', async () => {
    const fixture = TestBed.createComponent(BundleOptimizationPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.budgets.map((b) => b.type)).toEqual(['initial', 'anyComponentStyle']);
    await page.loadHeavyModule();
    expect(page.loaded()?.primes).toBe(17984);
    expect(page.loaded()?.chunk).toBeTruthy();
    expect(page.loading()).toBe(false);
  });

  it('sieve is correct', () => {
    expect(primesUpTo(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
  });
});
