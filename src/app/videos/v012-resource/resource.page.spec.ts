import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore, RANDOM } from '../../core/fake-backend/network-settings.store';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { Implementation, ResourcePage } from './resource.page';
import { abortable } from './user-api';

describe('ResourcePage (012)', () => {
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
    TestBed.inject(NetworkSettingsStore).latencyMs.set(30);
  });

  async function setup(impl: Implementation = 'resource') {
    const fixture = TestBed.createComponent(ResourcePage);
    fixture.componentInstance.implementation.set(impl);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  it.each<Implementation>(['resource', 'rxResource', 'httpResource'])(
    '%s: loading → resolved with the first page',
    async (impl) => {
      const { fixture, page } = await setup(impl);
      expect(page.active().status()).toBe('resolved');
      expect(page.users()).toHaveLength(8);
      expect(page.total()).toBe(480);
      expect(page.pageCount()).toBe(60);
      page.page.set(2);
      fixture.detectChanges();
      expect(page.active().status()).toBe('loading');
      await fixture.whenStable();
      expect(page.active().value()?.page).toBe(2);
    },
  );

  it('keeps the inactive implementations idle', async () => {
    const { page } = await setup('rxResource');
    expect(page.viaResource.status()).toBe('idle');
    expect(page.viaHttpResource.status()).toBe('idle');
  });

  it('cancels outdated requests when params change quickly', async () => {
    const { fixture, page } = await setup();
    page.setQuery('a');
    TestBed.tick();
    page.setQuery('ad');
    TestBed.tick();
    page.setQuery('ada');
    await fixture.whenStable();
    const log = TestBed.inject(RequestLogStore);
    expect(log.cancelledCount()).toBe(2);
    expect(page.users().every((u) => u.name.toLowerCase().includes('ada'))).toBe(true);
  });

  it('exposes errors and recovers with reload()', async () => {
    TestBed.inject(NetworkSettingsStore).errorRate.set(100);
    random = 0;
    const { fixture, page } = await setup('httpResource');
    expect(page.active().status()).toBe('error');
    expect(page.users()).toEqual([]);
    TestBed.inject(NetworkSettingsStore).errorRate.set(0);
    page.active().reload();
    await fixture.whenStable();
    expect(page.active().status()).toBe('resolved');
  });

  it('creates a user with an optimistic local value, then reloads', async () => {
    const { fixture, page } = await setup();
    page.newUser.set({ name: 'Zed Test', email: 'zed@example.com' });
    const creating = page.createUser();
    expect(page.active().status()).toBe('local');
    expect(page.users()[0]?.id).toBe(-1);
    await creating;
    await fixture.whenStable();
    expect(page.active().status()).toBe('resolved');
    expect(page.users()[0]?.name).toBe('Zed Test');
    expect(page.newUser()).toEqual({ name: '', email: '' });
  });

  it('does not post an invalid user', async () => {
    const { page } = await setup();
    await page.createUser();
    expect(page.newUserForm().touched()).toBe(true);
    expect(page.creating()).toBe(false);
  });
});

describe('abortable()', () => {
  it('resolves with the last value and unsubscribes on abort', async () => {
    const source = new Subject<number>();
    const controller = new AbortController();
    const promise = abortable(source, controller.signal);
    source.next(1);
    controller.abort('stop');
    await expect(promise).rejects.toBe('stop');
    expect(source.observed).toBe(false);
    const done = abortable(new Subject<number>(), new AbortController().signal);
    expect(done).toBeInstanceOf(Promise);
  });
});
