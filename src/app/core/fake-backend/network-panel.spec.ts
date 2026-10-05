import { TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { NetworkPanel } from './network-panel';
import { NetworkSettingsStore } from './network-settings.store';

describe('NetworkPanel', () => {
  it('edits the network settings and closes', async () => {
    const dismiss = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatBottomSheetRef, useValue: { dismiss } }],
    });
    const fixture = TestBed.createComponent(NetworkPanel);
    await fixture.whenStable();
    const settings = TestBed.inject(NetworkSettingsStore);
    const el = fixture.nativeElement as HTMLElement;
    const latency = el.querySelector<HTMLInputElement>('#latency')!;
    latency.value = '1200';
    latency.dispatchEvent(new Event('input'));
    latency.dispatchEvent(new Event('change'));
    expect(settings.latencyMs()).toBe(1200);
    el.querySelector<HTMLElement>('mat-slide-toggle button')!.click();
    expect(settings.offline()).toBe(true);
    const [reset, done] = [...el.querySelectorAll<HTMLButtonElement>('.actions button')];
    reset!.click();
    expect(settings.summary()).toBe('400 ms · 0 % errors');
    done!.click();
    expect(dismiss).toHaveBeenCalled();
  });
});
