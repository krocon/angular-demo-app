import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { PlainCounter, SignalCounter } from './counters';
import { ZonelessPage, isZoneLoaded } from './zoneless.page';

describe('ZonelessPage (011)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('runs without zone.js', () => {
    expect(isZoneLoaded()).toBe(false);
  });

  it('only re-renders the signal counter after setInterval', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ZonelessPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    await vi.advanceTimersByTimeAsync(3000);
    fixture.detectChanges(); // like the zoneless scheduler: only dirty views are refreshed
    const plain = fixture.debugElement.query(By.directive(PlainCounter))
      .componentInstance as PlainCounter;
    const signalCounter = fixture.debugElement.query(By.directive(SignalCounter))
      .componentInstance as SignalCounter;
    expect(plain.count).toBe(3);
    expect(signalCounter.count()).toBe(3);
    expect(el.querySelector('app-plain-counter .value')?.textContent).toBe('0');
    expect(el.querySelector('app-signal-counter .value')?.textContent).toBe('3');

    // A template event inside the plain counter marks it dirty → it catches up.
    el.querySelector<HTMLButtonElement>('app-plain-counter button')!.click();
    fixture.detectChanges();
    expect(el.querySelector('app-plain-counter .value')?.textContent).toBe('3');
    expect(fixture.componentInstance.appRenders).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('pauses both timers via an input', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ZonelessPage);
    fixture.componentInstance.running.set(false);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(2000);
    vi.useRealTimers();
    const signalCounter = fixture.debugElement.query(By.directive(SignalCounter))
      .componentInstance as SignalCounter;
    expect(signalCounter.count()).toBe(0);
  });
});
