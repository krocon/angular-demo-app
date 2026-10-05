import { HttpContext } from '@angular/common/http';
import { Signal } from '@angular/core';
import {
  ValidationError,
  email,
  max,
  min,
  minLength,
  pattern,
  required,
  schema,
  validate,
  validateHttp,
} from '@angular/forms/signals';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';

export interface SignUp {
  username: string;
  email: string;
  age: number | null;
  isCompany: boolean;
  companyName: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  handle: string;
}

export const EMPTY_SIGN_UP: SignUp = {
  username: '',
  email: '',
  age: null,
  isCompany: false,
  companyName: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  handle: '',
};

export const RESERVED_WORDS = ['admin', 'test', 'root', 'null'];

/** 4. A custom rule is a plain function: return `{ kind, message }` or null. */
export function noReservedWords(value: string): ValidationError | null {
  const hit = RESERVED_WORDS.find((word) => value.toLowerCase().includes(word));
  return hit ? { kind: 'reserved', message: `"${hit}" is a reserved word.` } : null;
}

export interface Availability {
  available: boolean;
}

/** Waits `ms` – used as a dynamic debounce so the demo slider can change it at runtime. */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** All five validation patterns in one schema. `debounceMs` is a signal so the UI can tune it. */
export function signUpSchema(debounceMs: Signal<number>) {
  return schema<SignUp>((path) => {
    // 1. Built-in validators
    required(path.username, { message: 'Username is required.' });
    minLength(path.username, 3, { message: 'At least 3 characters.' });
    pattern(path.username, /^[a-z0-9_]+$/, { message: 'Lowercase letters, digits and _ only.' });
    required(path.email, { message: 'Email is required.' });
    email(path.email, { message: 'Please enter a valid email.' });
    min(path.age, 18, { message: 'Minimum age is 18.' });
    max(path.age, 120, { message: 'Maximum age is 120.' });

    // 2. Conditional: only required when the checkbox is ticked
    required(path.companyName, {
      when: ({ valueOf }) => valueOf(path.isCompany),
      message: 'Company name is required for company accounts.',
    });

    // 3. Cross-field: compare with another field via valueOf()
    minLength(path.password, 8, { message: 'At least 8 characters.' });
    validate(path.confirmPassword, ({ value, valueOf }) =>
      value() !== valueOf(path.password)
        ? { kind: 'mismatch', message: 'Passwords do not match.' }
        : null,
    );

    // 4. Custom rule function
    validate(path.nickname, ({ value }) => noReservedWords(value()));

    // 5. Async: HTTP check with built-in debounce. Runs only once the sync rules pass.
    required(path.handle, { message: 'Pick a handle.' });
    minLength(path.handle, 3, { message: 'At least 3 characters.' });
    validateHttp(path.handle, {
      request: ({ value }) => ({
        url: `/api/usernames/${encodeURIComponent(value())}/available`,
        context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
      }),
      debounce: () => wait(debounceMs()), // static alternative: `debounce: 300`
      onSuccess: (result: Availability) =>
        result.available ? null : { kind: 'taken', message: 'This handle is already taken.' },
      onError: () => ({ kind: 'unreachable', message: 'Could not check availability.' }),
    });
  });
}
