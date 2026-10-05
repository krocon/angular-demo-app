import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LetSyntaxPage } from './let-syntax.page';

describe('LetSyntaxPage (015)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('derives subtotal, tax, total and free shipping with @let', async () => {
    const fixture = TestBed.createComponent(LetSyntaxPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const sums = () => [...el.querySelectorAll('.sums dd')].map((d) => d.textContent?.trim());
    expect(sums()).toEqual(['€88.40', '€16.80', '€4.90', '€110.10']);
    expect(el.querySelector('.banner')?.textContent).toContain('Add €11.60');

    fixture.componentInstance.change(1, 1);
    await fixture.whenStable();
    expect(sums()[0]).toBe('€113.30');
    expect(sums()[2]).toBe('free');
    expect(el.querySelector('.banner')?.textContent).toContain('Free shipping unlocked');
  });

  it('clamps quantities and keeps block-scoped @let values apart', async () => {
    const fixture = TestBed.createComponent(LetSyntaxPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.setQuantity(2, '500');
    expect(page.cart().find((i) => i.id === 2)?.quantity).toBe(99);
    page.setQuantity(2, 'abc');
    expect(page.cart().find((i) => i.id === 2)?.quantity).toBe(0);
    page.change(42, 1);
    const blocks = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.blocks code')].map(
      (c) => c.textContent,
    );
    expect(blocks).toEqual(['from block A', 'from block B']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.ticker strong')?.textContent,
    ).toBe('100');
  });
});
