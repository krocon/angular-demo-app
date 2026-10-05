import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { filterRows, generateRows, sortRows } from './big-table.data';
import { BigTablesPage } from './big-tables.page';

describe('big table data (009)', () => {
  it('generates deterministic rows and slices the cache', () => {
    const a = generateRows(50);
    const b = generateRows(10);
    expect(a).toHaveLength(50);
    expect(b[3]).toEqual(a[3]);
    expect(Object.keys(a[0]!)).toHaveLength(10);
  });

  it('sorts and filters without mutating', () => {
    const rows = generateRows(100);
    const sorted = sortRows(rows, 'score', 'desc');
    expect(sorted[0]!.score).toBeGreaterThanOrEqual(sorted[1]!.score);
    expect(rows[0]!.id).toBe(1);
    expect(sortRows(rows, 'id', 'asc')[0]!.id).toBe(1);
    const berlin = filterRows(rows, 'berlin');
    expect(berlin.every((r) => r.city === 'Berlin')).toBe(true);
    expect(filterRows(rows, '  ')).toBe(rows);
  });
});

describe('BigTablesPage (009)', () => {
  let confirm = true;
  const open = vi.fn(() => ({ afterClosed: () => of(confirm) }));

  beforeEach(() => {
    confirm = true;
    open.mockClear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MatDialog, useValue: { open } }],
    });
  });

  async function setup() {
    const fixture = TestBed.createComponent(BigTablesPage);
    fixture.componentInstance.rowCount.set(100);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('renders all rows in plain mode – DOM nodes grow with rows × columns', async () => {
    const { fixture, page, el } = await setup();
    await page.setMode('plain');
    await fixture.whenStable();
    expect(el.querySelectorAll('table.plain tbody tr')).toHaveLength(100);
    expect(page.domNodes()).toBeGreaterThan(100 * 5);
    page.setColumns(10);
    await fixture.whenStable();
    expect(el.querySelectorAll('table.plain tbody td')).toHaveLength(1000);
  });

  it('paginates with mat-table', async () => {
    const { fixture, page, el } = await setup();
    await page.setMode('paged');
    await fixture.whenStable();
    await fixture.whenStable();
    expect(el.querySelectorAll('tr.mat-mdc-row').length).toBeLessThanOrEqual(25);
    expect(page.dataSource().paginator).toBeTruthy();
  });

  it('virtual mode sorts and filters via computed()', async () => {
    const { page } = await setup();
    page.toggleSort('score');
    expect(page.sortKey()).toBe('score');
    page.toggleSort('score');
    expect(page.sortDirection()).toBe('desc');
    page.filter.set('berlin');
    expect(page.virtualRows().every((r) => r.city === 'Berlin')).toBe(true);
    expect(page.trackById(0, page.rows()[0]!)).toBe(1);
  });

  it('warns before rendering more than 10,000 plain rows', async () => {
    const { page } = await setup();
    await page.setMode('plain');
    confirm = false;
    await page.setRows(100_000);
    expect(open).toHaveBeenCalledTimes(1);
    expect(page.rowCount()).toBe(100);
    await page.setMode('virtual');
    await page.setRows(100_000);
    expect(page.rowCount()).toBe(100_000);
    await page.setMode('plain');
    expect(page.mode()).toBe('virtual');
    expect(open).toHaveBeenCalledTimes(2);
  });
});
