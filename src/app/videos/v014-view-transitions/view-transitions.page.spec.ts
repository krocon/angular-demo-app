import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore } from '../../core/fake-backend/network-settings.store';
import { routes } from './view-transitions.routes';

describe('ViewTransitionsPage (014)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'vt', children: routes }], withComponentInputBinding()),
        provideHttpClient(withInterceptors([fakeBackendInterceptor])),
      ],
    });
    TestBed.inject(NetworkSettingsStore).latencyMs.set(0);
  });

  it('shares view-transition-name between tile and detail header', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/vt');
    await harness.fixture.whenStable();
    const el = harness.fixture.nativeElement as HTMLElement;
    const tile = el.querySelector<HTMLElement>('app-product-grid .art');
    expect(el.querySelectorAll('app-product-grid li')).toHaveLength(24);
    expect(tile?.style.getPropertyValue('view-transition-name')).toBe('product-1');

    await harness.navigateByUrl('/vt/3');
    await harness.fixture.whenStable();
    const hero = el.querySelector<HTMLElement>('app-product-detail .hero');
    expect(hero?.style.getPropertyValue('view-transition-name')).toBe('product-3');
    expect(el.querySelector('app-product-detail h3')?.textContent).toBe('Lazy Chair');
    expect(el.querySelector('app-product-grid')).toBeNull();
  });

  it('feeds duration/easing as CSS variables and cleans up', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/vt/999');
    await harness.fixture.whenStable();
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--app-vt-duration')).toBe('400ms');
    expect((harness.fixture.nativeElement as HTMLElement).textContent).toContain(
      'Product 999 not found',
    );
    await harness.navigateByUrl('/');
    expect(root.style.getPropertyValue('--app-vt-duration')).toBe('');
  });
});
