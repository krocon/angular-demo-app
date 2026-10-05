import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, ViewTransitionInfo, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { VIDEO_CATALOG } from './catalog/video-catalog';
import { AppConfigStore } from './config/app-config.store';
import { fakeBackendInterceptor } from './fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore } from './fake-backend/network-settings.store';
import { AuthStore } from './http/auth.store';
import { HttpTraceStore } from './http/http-trace.store';
import { LayoutStore } from './layout/layout.store';
import { Notifier } from './notify/notifier';
import { SearchStore, matchesQuery } from './search/search.store';
import { THEME_STORAGE_KEY, ThemeStore } from './theme/theme.store';
import { AppTitleStrategy } from './title.strategy';
import { ViewTransitionSettingsStore } from './view-transitions/view-transition-settings.store';

@Component({ template: '' })
class Blank {}

describe('core services', () => {
  it('ThemeStore persists the mode and cycles light → dark → system', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const theme = TestBed.inject(ThemeStore);
    expect(theme.mode()).toBe('dark');
    theme.cycle();
    expect(theme.mode()).toBe('system');
    theme.cycle();
    expect(theme.mode()).toBe('light');
    TestBed.tick();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('ThemeStore survives broken storage', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(TestBed.inject(ThemeStore).mode()).toBe('system');
    spy.mockRestore();
  });

  it('SearchStore matches title, tags and number', () => {
    const search = TestBed.inject(SearchStore);
    expect(search.results()).toHaveLength(27);
    search.query.set('validateHttp');
    expect(search.results().map((v) => v.num)).toEqual(['002']);
    expect(matchesQuery(VIDEO_CATALOG[0], '001 signal')).toBe(true);
    expect(matchesQuery(VIDEO_CATALOG[0], 'nope')).toBe(false);
  });

  it('AuthStore logs in and out', () => {
    const auth = TestBed.inject(AuthStore);
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    auth.login('x');
    expect(auth.token()).toBe('x');
  });

  it('NetworkSettingsStore resets and summarizes', () => {
    const store = TestBed.inject(NetworkSettingsStore);
    store.latencyMs.set(1000);
    store.errorRate.set(20);
    expect(store.summary()).toBe('1000 ms · 20 % errors');
    store.offline.set(true);
    expect(store.summary()).toBe('Offline');
    store.reset();
    expect(store.summary()).toBe('400 ms · 0 % errors');
  });

  it('HttpTraceStore keeps 50 entries', () => {
    const trace = TestBed.inject(HttpTraceStore);
    for (let i = 0; i < 60; i++) {
      trace.add({ time: 0, method: 'GET', url: `/${i}`, outcome: '200', durationMs: 1 });
    }
    expect(trace.entries()).toHaveLength(50);
    trace.clear();
    expect(trace.entries()).toHaveLength(0);
  });

  it('LayoutStore exposes breakpoint signals', () => {
    const layout = TestBed.inject(LayoutStore);
    expect(layout.sidenavMode()).toBe(layout.isHandset() ? 'over' : 'side');
    expect(typeof layout.prefersReducedMotion()).toBe('boolean');
  });

  it('AppConfigStore loads /api/config and falls back on errors', async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([fakeBackendInterceptor]))],
    });
    const store = TestBed.inject(AppConfigStore);
    const settings = TestBed.inject(NetworkSettingsStore);
    settings.latencyMs.set(0);
    const loading = store.load();
    await vi.advanceTimersByTimeAsync(0);
    await loading;
    expect(store.source()).toBe('server');
    expect(store.isFeatureEnabled('featureB')).toBe(true);
    expect(store.featureList().length).toBe(3);
    settings.offline.set(true);
    const failing = store.load();
    await vi.advanceTimersByTimeAsync(0);
    await failing;
    expect(store.source()).toBe('fallback');
    expect(store.loadMs()).not.toBeNull();
    expect(TestBed.inject(HttpClient)).toBeTruthy();
    vi.useRealTimers();
  });

  it('AppTitleStrategy appends the app name', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'a', title: 'Alpha', component: Blank },
          { path: 'b', component: Blank },
        ]),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/a');
    expect(TestBed.inject(Title).getTitle()).toBe('Alpha · Angular 22 Demos');
    await harness.navigateByUrl('/b');
    expect(TestBed.inject(Title).getTitle()).toBe('Angular 22 Demos');
    expect(TestBed.inject(Router).url).toBe('/b');
  });

  it('ViewTransitionSettingsStore skips transitions when disabled', () => {
    const store = TestBed.inject(ViewTransitionSettingsStore);
    const transition = { skipTransition: vi.fn() };
    const info = { transition } as unknown as ViewTransitionInfo;
    store.onCreated(info);
    expect(transition.skipTransition).not.toHaveBeenCalled();
    store.enabled.set(false);
    store.onCreated(info);
    expect(transition.skipTransition).toHaveBeenCalledTimes(1);
    expect(store.created()).toBe(2);
    expect(store.skipped()).toBe(1);
  });

  it('Notifier lazily opens a snackbar and reports the action', async () => {
    const notifier = TestBed.inject(Notifier);
    const { MatSnackBar } = await import('@angular/material/snack-bar');
    const opened = notifier.open('Hello', 'Undo', 10);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Hello'));
    TestBed.inject(MatSnackBar)._openedSnackBarRef?.dismissWithAction();
    expect(await opened).toBe(true);
  });
});
