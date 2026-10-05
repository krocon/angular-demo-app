import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { filterPeople, generatePeople, sortPeople } from './people.data';
import { VirtualScrollingPage } from './virtual-scrolling.page';

describe('people data (013)', () => {
  it('filters and sorts', () => {
    const people = generatePeople(200);
    expect(people).toHaveLength(200);
    expect(filterPeople(people, 'oslo').every((p) => p.city === 'Oslo')).toBe(true);
    const byScore = sortPeople(people, 'score-desc');
    expect(byScore[0]!.score).toBeGreaterThanOrEqual(byScore[1]!.score);
    expect(sortPeople(people, 'name')[0]!.name <= sortPeople(people, 'name')[1]!.name).toBe(true);
    expect(sortPeople(people, 'city')[0]!.city).toBe('Berlin');
    expect(sortPeople(people, 'id')).toBe(people);
  });
});

describe('VirtualScrollingPage (013)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renders only a window of 100,000 rows', async () => {
    const fixture = TestBed.createComponent(VirtualScrollingPage);
    const viewportEl = () =>
      fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
    await fixture.whenStable();
    Object.defineProperty(viewportEl(), 'clientHeight', { value: 480 });
    fixture.componentInstance.viewport().checkViewportSize();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.visible()).toHaveLength(100_000);
    const rows = viewportEl().querySelectorAll('.vrow').length;
    expect(rows).toBeLessThan(200);
  });

  it('filters via computed and keeps maxBuffer ≥ minBuffer', async () => {
    const fixture = TestBed.createComponent(VirtualScrollingPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.query.set('Ada Lovelace');
    expect(page.visible().every((p) => p.name === 'Ada Lovelace')).toBe(true);
    page.minBufferPx.set(900);
    page.maxBufferPx.set(100);
    expect(page.effectiveMaxBuffer()).toBe(900);
    page.onScrolledIndex(42);
    expect(page.firstVisible()).toBe(42);
    expect(page.trackById(0, page.visible()[0]!)).toBe(page.visible()[0]!.id);
    const spy = vi.spyOn(page.viewport(), 'scrollToIndex').mockImplementation(() => undefined);
    page.scrollTo(10_000_000);
    expect(spy).toHaveBeenCalledWith(page.visible().length - 1);
  });
});
