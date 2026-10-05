import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { provideRouter } from '@angular/router';
import { ValidationPage } from './validation.page';
import { EMPTY_SIGN_UP, SignUp, noReservedWords, signUpSchema } from './validation.rules';

describe('Validation patterns (002)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  function createForm(patch: Partial<SignUp> = {}) {
    const model = signal<SignUp>({ ...EMPTY_SIGN_UP, ...patch });
    const f = form(model, signUpSchema(signal(0)), { injector: TestBed.inject(Injector) });
    return { model, f };
  }

  async function settle(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      TestBed.tick();
      await new Promise((r) => setTimeout(r));
    }
  }

  const kinds = (errors: readonly { kind: string }[]) => errors.map((e) => e.kind);

  it('applies the built-in validators', () => {
    const { model, f } = createForm({ username: 'A!', email: 'bad', age: 12 });
    expect(kinds(f.username().errors())).toEqual(['minLength', 'pattern']);
    expect(kinds(f.email().errors())).toEqual(['email']);
    expect(kinds(f.age().errors())).toEqual(['min']);
    model.update((m) => ({ ...m, age: 130 }));
    expect(kinds(f.age().errors())).toEqual(['max']);
    model.update((m) => ({ ...m, username: 'ada_99', email: 'ada@example.com', age: 30 }));
    expect(f.username().valid() && f.email().valid() && f.age().valid()).toBe(true);
  });

  it('requires the company name only when the checkbox is ticked (when)', () => {
    const { model, f } = createForm();
    expect(f.companyName().required()).toBe(false);
    expect(f.companyName().errors()).toEqual([]);
    model.update((m) => ({ ...m, isCompany: true }));
    expect(f.companyName().required()).toBe(true);
    expect(kinds(f.companyName().errors())).toEqual(['required']);
  });

  it('compares password and confirmation (cross-field)', () => {
    const { model, f } = createForm({ password: 'secret123', confirmPassword: 'secret12' });
    expect(f.confirmPassword().errors()[0]?.message).toBe('Passwords do not match.');
    model.update((m) => ({ ...m, confirmPassword: 'secret123' }));
    expect(f.confirmPassword().errors()).toEqual([]);
  });

  it('noReservedWords is a plain function', () => {
    expect(noReservedWords('superadmin')).toEqual({
      kind: 'reserved',
      message: '"admin" is a reserved word.',
    });
    expect(noReservedWords('ada')).toBeNull();
    const { f } = createForm({ nickname: 'test-user' });
    expect(kinds(f.nickname().errors())).toEqual(['reserved']);
  });

  it('validates the handle over HTTP with a pending state', async () => {
    const http = TestBed.inject(HttpTestingController);
    const { model, f } = createForm({ handle: 'ad' });
    await settle();
    http.expectNone(() => true); // sync rules fail → the async validator does not run
    model.update((m) => ({ ...m, handle: 'admin' }));
    await settle();
    expect(f.handle().pending()).toBe(true);
    http.expectOne('/api/usernames/admin/available').flush({ available: false });
    await settle();
    expect(f.handle().pending()).toBe(false);
    expect(kinds(f.handle().errors())).toEqual(['taken']);

    model.update((m) => ({ ...m, handle: 'ada' }));
    await settle();
    http.expectOne('/api/usernames/ada/available').flush({ available: true });
    await settle();
    expect(f.handle().valid()).toBe(true);
  });

  it('maps HTTP errors to an "unreachable" error', async () => {
    const http = TestBed.inject(HttpTestingController);
    const { f } = createForm({ handle: 'grace' });
    await settle();
    http.expectOne('/api/usernames/grace/available').flush(null, { status: 500, statusText: 'x' });
    await settle();
    expect(kinds(f.handle().errors())).toEqual(['unreachable']);
  });

  it('renders the page, counts keystrokes and resets', async () => {
    const fixture = TestBed.createComponent(ValidationPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.onHandleInput();
    expect(page.keystrokes()).toBe(1);
    page.validateAll();
    expect(page.signUp().touched()).toBe(true);
    page.reset();
    expect(page.signUp().touched()).toBe(false);
    expect(page.keystrokes()).toBe(0);
    expect(page.handleStatus()).toBe('Pick a handle.');
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('section.demo-card'),
    ).toHaveLength(5);
  });
});
