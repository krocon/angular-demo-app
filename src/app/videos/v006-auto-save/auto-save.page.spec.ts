import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore, RANDOM } from '../../core/fake-backend/network-settings.store';
import { AUTO_SAVE_DEBOUNCE_MS, AutoSavePage } from './auto-save.page';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('AutoSavePage (006)', () => {
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
    TestBed.inject(NetworkSettingsStore).latencyMs.set(0);
  });

  afterEach(() => vi.useRealTimers());

  async function setup() {
    const fixture = TestBed.createComponent(AutoSavePage);
    await fixture.whenStable();
    vi.useFakeTimers();
    return { fixture, page: fixture.componentInstance };
  }

  function type(page: AutoSavePage, name: string) {
    page.profile.displayName().value.set(name);
    page.profile.displayName().markAsDirty();
    TestBed.tick();
  }

  it('auto-saves after the debounce and resets to pristine', async () => {
    const { page } = await setup();
    type(page, 'Ada');
    type(page, 'Ada L');
    expect(page.status()).toBe('dirty');
    expect(page.hasUnsavedChanges()).toBe(true);
    await vi.advanceTimersByTimeAsync(AUTO_SAVE_DEBOUNCE_MS - 1);
    expect(page.log.entries()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(page.saving()).toBe(true);
    await vi.advanceTimersByTimeAsync(10);
    expect(page.status()).toBe('saved');
    expect(page.profile().dirty()).toBe(false);
    expect(page.log.entries().map((e) => e.message)).toEqual([
      '✓ saved',
      expect.stringContaining('"displayName":"Ada L"'),
    ]);
  });

  it('does not auto-save when disabled or invalid', async () => {
    const { page } = await setup();
    page.autoSave.set(false);
    type(page, 'X');
    await vi.advanceTimersByTimeAsync(1000);
    expect(page.log.entries()).toHaveLength(0);
    expect(page.canSave()).toBe(true);
    page.autoSave.set(true);
    type(page, '');
    await vi.advanceTimersByTimeAsync(1000);
    expect(page.log.entries()).toHaveLength(0);
    expect(page.canSave()).toBe(false);
  });

  it('shows "failed" when the backend errors and can retry', async () => {
    const { page } = await setup();
    TestBed.inject(NetworkSettingsStore).errorRate.set(100);
    random = 0;
    type(page, 'Grace');
    await vi.advanceTimersByTimeAsync(AUTO_SAVE_DEBOUNCE_MS);
    await vi.advanceTimersByTimeAsync(10);
    expect(page.status()).toBe('failed');
    TestBed.inject(NetworkSettingsStore).errorRate.set(0);
    page.saveNow();
    await vi.advanceTimersByTimeAsync(10);
    expect(page.status()).toBe('saved');
  });
});

describe('unsavedChangesGuard (006)', () => {
  const run = (component: HasUnsavedChanges) =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        component,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  it('allows leaving a pristine form', () => {
    expect(run({ hasUnsavedChanges: signal(false) })).toBe(true);
  });

  it('asks via MatDialog when dirty', async () => {
    const open = vi.fn(() => ({ afterClosed: () => of(true) }));
    TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: { open } }] });
    const result = run({ hasUnsavedChanges: signal(true) }) as Observable<boolean>;
    expect(await firstValueFrom(result)).toBe(true);
    expect(open).toHaveBeenCalled();
  });

  it('stays when the dialog is dismissed', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
      ],
    });
    const result = run({ hasUnsavedChanges: signal(true) }) as Observable<boolean>;
    expect(await firstValueFrom(result)).toBe(false);
  });
});
