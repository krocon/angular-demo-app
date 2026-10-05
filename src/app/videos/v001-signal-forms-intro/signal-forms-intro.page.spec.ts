import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignalFormsIntroPage } from './signal-forms-intro.page';

describe('SignalFormsIntroPage (001)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function setup() {
    const fixture = TestBed.createComponent(SignalFormsIntroPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('starts invalid with required errors from the schema', async () => {
    const { page } = await setup();
    expect(page.registration().valid()).toBe(false);
    expect(page.registration.name().errors()[0]?.message).toBe('Please tell us your name.');
    expect(page.flags()).toEqual({ valid: false, invalid: true, dirty: false, touched: false });
  });

  it('validates email and min age with custom messages', async () => {
    const { page } = await setup();
    page.model.set({ name: 'Ada', email: 'nope', age: 12, newsletter: false });
    expect(page.registration.email().errors()[0]?.message).toContain('email address');
    expect(page.registration.age().errors()[0]?.message).toContain('18');
    page.model.update((m) => ({ ...m, email: 'ada@example.com', age: 36 }));
    expect(page.registration().valid()).toBe(true);
  });

  it('syncs model → inputs and input → model', async () => {
    const { fixture, page, el } = await setup();
    page.fillExample();
    await fixture.whenStable();
    const name = el.querySelector<HTMLInputElement>('input[autocomplete=name]')!;
    expect(name.value).toBe('Ada Lovelace');
    name.value = 'Grace';
    name.dispatchEvent(new Event('input'));
    expect(page.model().name).toBe('Grace');
    expect(page.registration().dirty()).toBe(true);
  });

  it('shows mat-error once a field is touched and resets', async () => {
    const { fixture, page, el } = await setup();
    const email = el.querySelector<HTMLInputElement>('input[type=email]')!;
    email.value = 'x';
    email.dispatchEvent(new Event('input'));
    email.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(el.querySelector('mat-error')?.textContent).toContain('email address');
    page.reset();
    await fixture.whenStable();
    expect(page.registration().touched()).toBe(false);
    expect(page.model().email).toBe('');
  });
});
