import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignalComponentApiPage } from './signal-component-api.page';

describe('SignalComponentApiPage (017)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function setup() {
    const fixture = TestBed.createComponent(SignalComponentApiPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('passes inputs and derives initials with computed()', async () => {
    const { fixture, page, el } = await setup();
    expect(page.card().initials()).toBe('AL');
    page.name.set('grace brewster hopper');
    page.highlighted.set(true);
    await fixture.whenStable();
    expect(page.card().initials()).toBe('GB');
    expect(el.querySelector('app-user-card')?.classList).toContain('highlighted');
  });

  it('syncs [(rating)] in both directions', async () => {
    const { fixture, page, el } = await setup();
    el.querySelector<HTMLButtonElement>('app-user-card [aria-label="Rate 5"]')!.click();
    expect(page.rating()).toBe(5);
    page.rating.set(1);
    await fixture.whenStable();
    expect(page.card().rating()).toBe(1);
  });

  it('counts projected content and logs outputs and effects', async () => {
    const { fixture, page, el } = await setup();
    expect(page.card().tags()).toHaveLength(2);
    page.addTag();
    await fixture.whenStable();
    expect(page.card().tags()).toHaveLength(3);
    page.removeTag();
    await fixture.whenStable();
    expect(page.card().tags()).toHaveLength(2);
    el.querySelector<HTMLButtonElement>('app-user-card button[mat-flat-button]')!.click();
    expect(page.log.entries()[0]?.message).toBe('output (selected): Ada Lovelace');
    expect(page.log.entries().some((e) => e.message.startsWith('effect:'))).toBe(true);
  });

  it('focuses the child input through viewChild()', async () => {
    const { page } = await setup();
    page.card().focusInput();
    expect(document.activeElement).toBe(page.card().nameInput().nativeElement);
  });
});
