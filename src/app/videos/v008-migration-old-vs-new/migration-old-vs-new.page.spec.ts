import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MigrationOldVsNewPage } from './migration-old-vs-new.page';
import { orderTotal } from './order';

describe('MigrationOldVsNewPage (008)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('computes the same total in both implementations', async () => {
    const fixture = TestBed.createComponent(MigrationOldVsNewPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.reactive().total()).toBe(orderTotal(2, 49.9, 10));
    expect(page.sameTotal()).toBe(true);

    page.reactive().form.controls.pricing.controls.quantity.setValue(5);
    expect(page.reactive().total()).toBe(orderTotal(5, 49.9, 10));
    page.signals().order.pricing.quantity().value.set(5);
    expect(page.signals().total()).toBe(orderTotal(5, 49.9, 10));
    expect(page.sameTotal()).toBe(true);
  });

  it('shows fewer lines and no subscriptions for Signal Forms', async () => {
    const fixture = TestBed.createComponent(MigrationOldVsNewPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.signalLines).toBeLessThan(page.reactiveLines);
    expect(page.signals().subscriptions).toBe(0);
    expect(page.reactive().subscriptions).toBe(1);
  });

  it('validates the signal form', async () => {
    const fixture = TestBed.createComponent(MigrationOldVsNewPage);
    await fixture.whenStable();
    const order = fixture.componentInstance.signals().order;
    order.pricing.discount().value.set(150);
    expect(order().valid()).toBe(false);
    expect(orderTotal(1, 10, 0)).toBe(10);
  });
});
