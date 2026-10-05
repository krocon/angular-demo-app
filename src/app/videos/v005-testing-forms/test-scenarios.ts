import { Injector, signal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { EMPTY_LOGIN, Login, loginSchema } from './login-form';

export interface Scenario {
  readonly name: string;
  readonly expectation: string;
  /** Arrange + act on a fresh form, return what we observed. */
  readonly run: (f: FieldTree<Login>, model: ReturnType<typeof signal<Login>>) => unknown;
  readonly expected: unknown;
}

/**
 * The same scenarios run in two places: in `login-form.spec.ts` (Vitest, `ng test`) and in the
 * browser on the demo page. Set the model, read the state – no fakeAsync, no tick.
 */
export const SCENARIOS: readonly Scenario[] = [
  {
    name: 'empty form → invalid',
    expectation: 'valid() is false and two "required" errors exist',
    run: (f) => ({
      valid: f().valid(),
      kinds: f()
        .errorSummary()
        .map((e) => e.kind),
    }),
    expected: { valid: false, kinds: ['required', 'required'] },
  },
  {
    name: 'invalid email → email error',
    expectation: 'email field reports kind "email"',
    run: (f, model) => {
      model.set({ ...EMPTY_LOGIN, email: 'not-an-email' });
      return f
        .email()
        .errors()
        .map((e) => e.kind);
    },
    expected: ['email'],
  },
  {
    name: 'short password → minLength error',
    expectation: 'password field reports kind "minLength"',
    run: (f, model) => {
      model.set({ ...EMPTY_LOGIN, password: 'short' });
      return f
        .password()
        .errors()
        .map((e) => e.kind);
    },
    expected: ['minLength'],
  },
  {
    name: 'valid input → submit enabled',
    expectation: 'valid() is true',
    run: (f, model) => {
      model.set({ email: 'ada@example.com', password: 'correct horse', rememberMe: true });
      return f().valid();
    },
    expected: true,
  },
  {
    name: 'programmatic set is not dirty',
    expectation: 'dirty() stays false when only the model changes',
    run: (f, model) => {
      model.update((m) => ({ ...m, email: 'x@y.z' }));
      return f().dirty();
    },
    expected: false,
  },
  {
    name: 'markAsTouched + reset()',
    expectation: 'touched() becomes true, reset() makes it pristine again',
    run: (f) => {
      f().markAsTouched();
      const touched = f().touched();
      f().reset();
      return [touched, f().touched()];
    },
    expected: [true, false],
  },
];

export interface ScenarioResult {
  readonly name: string;
  readonly passed: boolean;
  readonly actual: unknown;
  readonly durationMs: number;
}

export function runScenario(scenario: Scenario, injector: Injector): ScenarioResult {
  const started = performance.now();
  const model = signal<Login>({ ...EMPTY_LOGIN });
  const f = form(model, loginSchema, { injector });
  const actual = scenario.run(f, model);
  return {
    name: scenario.name,
    passed: JSON.stringify(actual) === JSON.stringify(scenario.expected),
    actual,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}
