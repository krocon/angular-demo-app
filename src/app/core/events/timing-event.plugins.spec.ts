import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { EventPluginStatsStore } from './event-plugin-stats.store';
import { DebounceEventPlugin, ThrottleEventPlugin, parseTimingEvent } from './timing-event.plugins';

@Component({
  selector: 'app-plugin-host',
  template: `@if (show()) {
    <input class="d" (input.debounce.300)="debounced = debounced + 1" />
    <input class="t" (input.throttle.300)="throttled = throttled + 1" />
  }`,
})
class PluginHost {
  readonly show = signal(true);
  debounced = 0;
  throttled = 0;
}

describe('timing event plugins', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EVENT_MANAGER_PLUGINS, useClass: DebounceEventPlugin, multi: true },
        { provide: EVENT_MANAGER_PLUGINS, useClass: ThrottleEventPlugin, multi: true },
      ],
    });
  });
  afterEach(() => vi.useRealTimers());

  it('parses event names', () => {
    expect(parseTimingEvent('input.debounce.500')).toEqual({
      event: 'input',
      mode: 'debounce',
      ms: 500,
    });
    expect(parseTimingEvent('keyup.throttle.20')).toEqual({
      event: 'keyup',
      mode: 'throttle',
      ms: 20,
    });
    expect(parseTimingEvent('keydown.enter')).toBeNull();
  });

  it('supports only its own syntax', () => {
    const debounce = TestBed.runInInjectionContext(() => new DebounceEventPlugin());
    const throttle = TestBed.runInInjectionContext(() => new ThrottleEventPlugin());
    expect(debounce.supports('input.debounce.500')).toBe(true);
    expect(debounce.supports('input.throttle.500')).toBe(false);
    expect(debounce.supports('click')).toBe(false);
    expect(throttle.supports('scroll.throttle.100')).toBe(true);
  });

  it('debounces and throttles template listeners and cleans up on destroy', async () => {
    const fixture = TestBed.createComponent(PluginHost);
    await fixture.whenStable();
    vi.useFakeTimers();
    const stats = TestBed.inject(EventPluginStatsStore);
    expect(stats.total()).toBe(2);
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    const d = el.querySelector('.d')!;
    const t = el.querySelector('.t')!;
    for (let i = 0; i < 5; i++) {
      d.dispatchEvent(new Event('input'));
      t.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(host.debounced).toBe(0);
    await vi.advanceTimersByTimeAsync(300);
    expect(host.debounced).toBe(1);
    expect(host.throttled).toBe(2);

    d.dispatchEvent(new Event('input'));
    host.show.set(false);
    fixture.detectChanges();
    expect(stats.total()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(host.debounced).toBe(1);
  });
});
