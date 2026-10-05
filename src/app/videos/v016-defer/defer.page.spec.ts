import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DeferPage } from './defer.page';

describe('DeferPage (016)', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }),
  );

  it('shows placeholders first and renders each block on demand', async () => {
    const fixture = TestBed.createComponent(DeferPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.placeholder').length).toBeGreaterThanOrEqual(3);
    expect(el.querySelector('app-heavy-chart')).toBeNull();

    const blocks = await fixture.getDeferBlocks();
    expect(blocks).toHaveLength(4);
    for (const block of blocks) {
      await block.render(DeferBlockState.Complete);
    }
    expect(el.querySelector('app-heavy-chart svg path')).not.toBeNull();
    expect(el.querySelector('app-rich-text-editor textarea')).not.toBeNull();
    expect(el.querySelector('app-help-content dl')).not.toBeNull();
    expect(el.querySelectorAll('app-report-panel tbody tr')).toHaveLength(4);
    const messages = fixture.componentInstance.log.entries().map((e) => e.message);
    expect(messages).toHaveLength(4);
    expect(messages.join()).toContain('HeavyChart (on viewport)');
  });

  it('renders loading and error states', async () => {
    const fixture = TestBed.createComponent(DeferPage);
    await fixture.whenStable();
    const blocks = await fixture.getDeferBlocks();
    const chart = blocks[3]!;
    await chart.render(DeferBlockState.Loading);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('mat-progress-spinner'),
    ).not.toBeNull();
    await chart.render(DeferBlockState.Error);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Could not load the chart.',
    );
  });

  it('editor wraps the selection', async () => {
    const fixture = TestBed.createComponent(DeferPage);
    await fixture.whenStable();
    const blocks = await fixture.getDeferBlocks();
    await blocks[1]!.render(DeferBlockState.Complete);
    const textarea = (fixture.nativeElement as HTMLElement).querySelector('textarea')!;
    textarea.setSelectionRange(0, 8);
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label=Bold]')!
      .click();
    await fixture.whenStable();
    expect(textarea.value.startsWith('**Deferred**')).toBe(true);
  });
});
