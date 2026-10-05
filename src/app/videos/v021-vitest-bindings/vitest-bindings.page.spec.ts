import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore } from '../../core/fake-backend/network-settings.store';
import { parseSpec } from './spec-parser';
import { VitestBindingsPage } from './vitest-bindings.page';

describe('VitestBindingsPage (021)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([fakeBackendInterceptor]))],
    });
    TestBed.inject(NetworkSettingsStore).latencyMs.set(0);
  });

  it('lists the real spec files in the test explorer', async () => {
    const fixture = TestBed.createComponent(VitestBindingsPage);
    await fixture.whenStable();
    const [stepper, badge] = fixture.componentInstance.specs;
    expect(stepper?.suite).toBe('QuantityStepper');
    expect(stepper?.tests.map((t) => t.name)).toEqual([
      'binds an input to a signal with inputBinding',
      'catches an output with outputBinding and a vi.fn() spy',
      'syncs a model() both ways with twoWayBinding',
    ]);
    expect(badge?.tests).toHaveLength(2);
    expect(stepper?.tests[0]?.code.startsWith("it('binds")).toBe(true);
  });

  it('wires the live components', async () => {
    const fixture = TestBed.createComponent(VitestBindingsPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const inc = el.querySelector<HTMLButtonElement>('app-quantity-stepper [aria-label=Increase]')!;
    inc.click();
    inc.click();
    inc.click();
    expect(fixture.componentInstance.quantity()).toBe(5);
    expect(fixture.componentInstance.log.entries()[0]?.message).toBe('limitReached: max');
    await vi.waitFor(() =>
      expect(el.querySelector('app-user-badge [data-testid=name]')).not.toBeNull(),
    );
  });

  it('parseSpec handles files without tests', () => {
    expect(parseSpec('')).toEqual({ suite: 'spec', tests: [] });
  });
});
