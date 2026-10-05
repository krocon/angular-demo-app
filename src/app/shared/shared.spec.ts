import { inputBinding, outputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiStatusChip } from './api-status-chip/api-status-chip';
import { BeforeAfter } from './before-after/before-after';
import { snippet } from './code-viewer/code-snippet';
import { EventLog, EventLogBuffer } from './event-log/event-log';
import { MetricTile } from './metric-tile/metric-tile';
import { StateInspector } from './state-inspector/state-inspector';
import { domNodeCount } from './utils/dom';
import { injectFpsMeter } from './utils/fps-meter';

describe('shared building blocks', () => {
  it('BeforeAfter shows line counts and the difference', async () => {
    const fixture = TestBed.createComponent(BeforeAfter, {
      bindings: [
        inputBinding('before', () => snippet('old.ts', 'a\nb\nc\nd\n')),
        inputBinding('after', () => snippet('new.ts', 'a\n')),
      ],
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('−3 lines');
    expect(el.textContent).toContain('(4 lines)');
    expect(el.querySelectorAll('app-code-viewer')).toHaveLength(2);
    expect(fixture.componentInstance.diffLabel()).toBe('−3 lines');
  });

  it('BeforeAfter reports growth and equality', () => {
    const fixture = TestBed.createComponent(BeforeAfter, {
      bindings: [
        inputBinding('before', () => snippet('old.ts', 'a\n')),
        inputBinding('after', () => snippet('new.ts', 'a\nb\n')),
      ],
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.diffLabel()).toBe('+1 lines');
  });

  it('StateInspector renders JSON and flags', async () => {
    const value = signal<unknown>({ name: 'Ada', when: new Date(0), fn: () => 1 });
    const fixture = TestBed.createComponent(StateInspector, {
      bindings: [
        inputBinding('value', value),
        inputBinding('flags', () => ({ valid: true, dirty: false })),
      ],
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('pre')?.textContent).toContain('"name": "Ada"');
    expect(el.querySelector('pre')?.textContent).toContain('1970-01-01');
    expect(el.querySelector('pre')?.textContent).toContain('[function]');
    expect(el.querySelectorAll('mat-chip')).toHaveLength(2);
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;
    value.set(circular);
    await fixture.whenStable();
    expect(el.querySelector('pre')?.textContent).toContain('[circular]');
  });

  it('EventLogBuffer keeps newest first and caps entries', () => {
    const log = new EventLogBuffer(2);
    log.log('a');
    log.log('b');
    log.log('c');
    expect(log.entries().map((e) => e.message)).toEqual(['c', 'b']);
    log.clear();
    expect(log.entries()).toEqual([]);
  });

  it('EventLog renders entries and emits clear', async () => {
    const log = new EventLogBuffer();
    log.log('hello');
    const cleared = vi.fn();
    const fixture = TestBed.createComponent(EventLog, {
      bindings: [inputBinding('entries', log.entries), outputBinding('cleared', cleared)],
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('hello');
    el.querySelector('button')!.click();
    expect(cleared).toHaveBeenCalled();
  });

  it('MetricTile and ApiStatusChip render their inputs', async () => {
    const tile = TestBed.createComponent(MetricTile, {
      bindings: [
        inputBinding('label', () => 'DOM nodes'),
        inputBinding('value', () => 42),
        inputBinding('unit', () => 'nodes'),
        inputBinding('trend', () => 'up'),
      ],
    });
    await tile.whenStable();
    expect((tile.nativeElement as HTMLElement).getAttribute('aria-label')).toBe(
      'DOM nodes: 42 nodes',
    );
    const chip = TestBed.createComponent(ApiStatusChip, {
      bindings: [inputBinding('status', () => 'experimental')],
    });
    await chip.whenStable();
    expect((chip.nativeElement as HTMLElement).textContent).toContain('Experimental');
    expect((chip.nativeElement as HTMLElement).classList).toContain('experimental');
  });

  it('domNodeCount counts element nodes', () => {
    const div = document.createElement('div');
    div.innerHTML = '<p><span></span></p><p></p>';
    expect(domNodeCount(div)).toBe(4);
    expect(domNodeCount(null)).toBe(0);
  });

  it('FPS meter measures frames and stops on destroy', () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => callbacks.push(cb));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const meter = TestBed.runInInjectionContext(() => injectFpsMeter(100));
    const start = performance.now();
    meter.start();
    for (let i = 1; i <= 6; i++) {
      callbacks.shift()?.(start + i * 20);
    }
    expect(meter.fps()).toBe(50);
    meter.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
