import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { insertAt, move, removeAt } from './address-book';
import { DynamicArraysPage } from './dynamic-arrays.page';

describe('DynamicArraysPage (003)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function setup() {
    const fixture = TestBed.createComponent(DynamicArraysPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('validates every row with applyEach', async () => {
    const { page } = await setup();
    expect(page.rows()).toBe(2);
    expect(page.invalidRows()).toBe(1);
    const second = page.book.addresses[1]!;
    expect(second.street().errors()[0]?.message).toBe('Street is required.');
    expect(second.zip().errors()[0]?.message).toBe('4–5 digits.');
    expect(page.book().valid()).toBe(false);
  });

  it('adds, duplicates, moves and removes rows immutably', async () => {
    const { fixture, page, el } = await setup();
    const before = page.model().addresses;
    page.add();
    expect(page.model().addresses).not.toBe(before);
    expect(page.rows()).toBe(3);
    expect(page.invalidRows()).toBe(2);
    page.duplicate(0);
    expect(page.model().addresses[1]).toEqual(page.model().addresses[0]);
    expect(page.model().addresses[1]).not.toBe(page.model().addresses[0]);
    page.moveBy(0, 1);
    page.remove(0);
    expect(page.rows()).toBe(3);
    await fixture.whenStable();
    expect(el.querySelectorAll('li.row')).toHaveLength(3);
    expect(el.querySelectorAll('li.row.invalid')).toHaveLength(2);
  });

  it('reorders via drag & drop and fixes the form when rows become valid', async () => {
    const { page } = await setup();
    page.drop({ previousIndex: 1, currentIndex: 0 } as CdkDragDrop<unknown>);
    expect(page.model().addresses[0]?.city).toBe('Vienna');
    page.book.addresses[0]!.street().value.set('Zone Lane 2');
    page.book.addresses[0]!.zip().value.set('1010');
    expect(page.invalidRows()).toBe(0);
    expect(page.book().valid()).toBe(true);
    page.showErrors();
    expect(page.book().touched()).toBe(true);
  });

  it('enforces the max number of rows', async () => {
    const { page } = await setup();
    for (let i = 0; i < 5; i++) page.add();
    expect(page.book.addresses().errors()[0]?.message).toBe('At most 6 addresses.');
  });

  it('array helpers are pure', () => {
    const list = [1, 2, 3];
    expect(insertAt(list, 1, 9)).toEqual([1, 9, 2, 3]);
    expect(removeAt(list, 0)).toEqual([2, 3]);
    expect(move(list, 0, 2)).toEqual([2, 3, 1]);
    expect(move(list, 0, 5)).toEqual([1, 2, 3]);
    expect(list).toEqual([1, 2, 3]);
  });
});
