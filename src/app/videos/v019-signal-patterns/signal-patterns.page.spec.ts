import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PatternAdvisor } from './pattern-advisor';
import { ACCENT_KEY, SignalPatternsPage } from './signal-patterns.page';
import { FakeTickerSocket, tickerStream } from './ticker-socket';

describe('SignalPatternsPage (019)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function setup() {
    const fixture = TestBed.createComponent(SignalPatternsPage);
    fixture.componentInstance.streaming.set(false);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  it('computed and linkedSignal', async () => {
    const { page } = await setup();
    expect(page.total()).toBe(59.97);
    page.selected.set('Cherry');
    expect(page.selected()).toBe('Cherry');
    page.category.set('Nuts');
    expect(page.selected()).toBe('Almond');
  });

  it('a custom equal stops downstream recomputation', async () => {
    const { page } = await setup();
    page.plainDownstream();
    page.equalDownstream();
    const plain = page.plainRuns();
    const equal = page.equalRuns();
    page.setSamePoint();
    page.plainDownstream();
    page.equalDownstream();
    expect(page.plainRuns()).toBe(plain + 1);
    expect(page.equalRuns()).toBe(equal);
    page.movePoint();
    page.equalDownstream();
    expect(page.equalRuns()).toBe(equal + 1);
  });

  it('persists the accent with an effect', async () => {
    const { fixture, page } = await setup();
    page.accent.set('teal');
    await fixture.whenStable();
    expect(localStorage.getItem(ACCENT_KEY)).toBe('teal');
  });

  it('debounced() waits for a quiet period, throttleTime emits leading + trailing', async () => {
    const { fixture, page } = await setup();
    page.type('a');
    page.type('ab');
    page.type('abc');
    await fixture.whenStable();
    expect(page.keystrokes()).toBe(3);
    expect(page.debouncedQuery.value()).toBe('');
    await vi.waitFor(() => expect(page.debouncedQuery.value()).toBe('abc'), { timeout: 2000 });
    await vi.waitFor(() => expect(page.throttledQuery()).toBe('abc'), { timeout: 2000 });
  });

  it('streams ticks into a resource and closes the socket on abort', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const stream = tickerStream('NG', controller.signal);
    await vi.advanceTimersByTimeAsync(2500);
    const item = stream();
    expect('value' in item && item.value.length).toBe(3);
    controller.abort();
    await vi.advanceTimersByTimeAsync(2000);
    const after = stream();
    expect('value' in after && after.value.length).toBe(3);
    const socket = new FakeTickerSocket('X', 100);
    socket.close();
    expect(socket.closed).toBe(true);
    vi.useRealTimers();
  });

  it('resource status follows the connection toggle', async () => {
    const { fixture, page } = await setup();
    expect(page.ticker.status()).toBe('idle');
    page.streaming.set(true);
    await vi.waitFor(() => expect(page.lastTick()).toBeDefined(), { timeout: 3000 });
    expect(page.ticker.status()).toBe('resolved');
    page.streaming.set(false);
    await fixture.whenStable();
    expect(page.ticker.status()).toBe('idle');
  });
});

describe('PatternAdvisor (019)', () => {
  it('walks the question tree to a recommendation', () => {
    const advisor = TestBed.createComponent(PatternAdvisor).componentInstance;
    advisor.answer(true);
    advisor.answer(true);
    expect(advisor.result()?.pattern).toBe('linkedSignal()');
    advisor.restart();
    advisor.answer(false);
    advisor.answer(true);
    advisor.answer(false);
    advisor.answer(true);
    expect(advisor.result()?.pattern).toBe('rxResource()');
    expect(advisor.trail()).toHaveLength(4);
    advisor.answer(true); // no-op once answered
    advisor.restart();
    for (let i = 0; i < 4; i++) advisor.answer(false);
    expect(advisor.result()?.pattern).toBe('signal()');
  });
});
