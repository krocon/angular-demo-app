import { TestBed } from '@angular/core/testing';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { EventPluginStatsStore } from '../../core/events/event-plugin-stats.store';
import { DebounceEventPlugin, ThrottleEventPlugin } from '../../core/events/timing-event.plugins';
import { EventManagerPluginsPage } from './event-manager-plugins.page';

describe('EventManagerPluginsPage (027)', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: EVENT_MANAGER_PLUGINS, useClass: DebounceEventPlugin, multi: true },
        { provide: EVENT_MANAGER_PLUGINS, useClass: ThrottleEventPlugin, multi: true },
      ],
    }),
  );

  it('calls the debounced handler once after typing stops', async () => {
    const fixture = TestBed.createComponent(EventManagerPluginsPage);
    await fixture.whenStable();
    vi.useFakeTimers();
    const el = fixture.nativeElement as HTMLElement;
    const [plain, debounced] = [...el.querySelectorAll<HTMLInputElement>('.field input')];
    for (const text of ['a', 'an', 'ang']) {
      plain!.value = text;
      plain!.dispatchEvent(new Event('input'));
      debounced!.value = text;
      debounced!.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(100);
    }
    const page = fixture.componentInstance;
    expect(page.plainCalls()).toBe(3);
    expect(page.debouncedCalls()).toBe(0);
    await vi.advanceTimersByTimeAsync(500);
    expect(page.debouncedCalls()).toBe(1);
    expect(page.debouncedValue()).toBe('ang');
    vi.useRealTimers();
  });

  it('drops the active listener count when the probe is destroyed', async () => {
    const fixture = TestBed.createComponent(EventManagerPluginsPage);
    await fixture.whenStable();
    const stats = TestBed.inject(EventPluginStatsStore);
    const withProbe = stats.total();
    fixture.componentInstance.showProbe.set(false);
    await fixture.whenStable();
    expect(stats.total()).toBe(withProbe - 3);
    expect(stats.active()['throttle']).toBe(0);
  });

  it('logs built-in key events and labels the slider', async () => {
    const fixture = TestBed.createComponent(EventManagerPluginsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[placeholder]',
    )!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }),
    );
    expect(page.log.entries().map((e) => e.message)).toEqual([
      '(keydown.control.k) fired',
      '(keydown.enter) fired',
    ]);
    expect(page.labelFor(2)).toBe('1000');
    page.onVariant();
    expect(page.variantCalls()).toBe(1);
  });
});
