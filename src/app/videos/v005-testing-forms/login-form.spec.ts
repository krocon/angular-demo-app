import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoginForm } from './login-form';
import { SCENARIOS, runScenario } from './test-scenarios';

// Logic tests: synchronous – set the model, read the state.
describe('login form schema', () => {
  it.each(SCENARIOS.map((s) => [s.name, s] as const))('%s', (_, scenario) => {
    const result = runScenario(scenario, TestBed.inject(Injector));
    expect(result.actual).toEqual(scenario.expected);
  });
});

// Component test: real DOM interaction, still no fakeAsync/tick.
describe('LoginForm component', () => {
  it('enables submit once the inputs are valid and emits the model', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const submit = el.querySelector<HTMLButtonElement>('[data-testid=submit]')!;
    expect(submit.disabled).toBe(true);

    const type = (id: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`[data-testid=${id}]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    type('email', 'ada@example.com');
    type('password', 'correct horse');
    await fixture.whenStable();
    expect(submit.disabled).toBe(false);

    const emitted = vi.fn();
    fixture.componentInstance.loggedIn.subscribe(emitted);
    submit.click();
    expect(emitted).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'correct horse',
      rememberMe: false,
    });
  });
});
