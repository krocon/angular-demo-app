import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ResourceSnapshot, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore, RANDOM } from '../../core/fake-backend/network-settings.store';
import { describeSnapshot, keepPreviousValue } from './keep-previous';
import { ResourceCompositionPage } from './resource-composition.page';

describe('ResourceCompositionPage (026)', () => {
  let random = 0.99;

  beforeEach(() => {
    random = 0.99;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([fakeBackendInterceptor])),
        { provide: RANDOM, useValue: () => random },
      ],
    });
    TestBed.inject(NetworkSettingsStore).latencyMs.set(20);
  });

  async function setup() {
    const fixture = TestBed.createComponent(ResourceCompositionPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  it('chains company after user', async () => {
    const { page } = await setup();
    expect(page.user.status()).toBe('resolved');
    expect(page.company.status()).toBe('resolved');
    expect(page.company.value()?.id).toBe(page.user.value()?.companyId);
  });

  it('the company waits while the user loads', async () => {
    const { fixture, page } = await setup();
    page.userId.set(5);
    fixture.detectChanges();
    expect(page.user.status()).toBe('loading');
    expect(page.company.status()).toBe('loading');
    await fixture.whenStable();
    expect(page.company.value()?.id).toBe(page.user.value()?.companyId);
  });

  it('propagates the user error to the company', async () => {
    const { fixture, page } = await setup();
    TestBed.inject(NetworkSettingsStore).errorRate.set(100);
    random = 0;
    page.userId.set(3);
    await fixture.whenStable();
    expect(page.user.status()).toBe('error');
    expect(page.company.status()).toBe('error');
    expect(page.userSnapshot()).toMatchObject({ status: 'error' });
  });

  it('keeps the previous company visible while reloading', async () => {
    const { fixture, page } = await setup();
    const before = page.company.value();
    page.userId.set(2);
    fixture.detectChanges();
    expect(page.company.hasValue()).toBe(false);
    expect(page.smoothCompany.status()).toBe('reloading');
    expect(page.smoothCompany.value()).toEqual(before);
    await fixture.whenStable();
    expect(page.smoothCompany.status()).toBe('resolved');
    page.keepPrevious.set(false);
    expect(page.shown()).toBe(page.company);
  });
});

describe('keepPreviousValue()', () => {
  it('only rewrites loading snapshots that follow a value', () => {
    const source = signal<ResourceSnapshot<number | undefined>>({
      status: 'loading',
      value: undefined,
    });
    const kept = TestBed.runInInjectionContext(() => keepPreviousValue(source));
    expect(kept()).toEqual({ status: 'loading', value: undefined });
    source.set({ status: 'resolved', value: 1 });
    expect(kept()).toEqual({ status: 'resolved', value: 1 });
    source.set({ status: 'loading', value: undefined });
    expect(kept()).toEqual({ status: 'reloading', value: 1 });
    source.set({ status: 'error', error: new Error('x') });
    expect(describeSnapshot(kept())).toEqual({ status: 'error', error: 'x' });
  });
});
