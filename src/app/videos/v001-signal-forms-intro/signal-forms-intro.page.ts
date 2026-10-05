import { Component, computed, signal } from '@angular/core';
import { FormField, email, form, min, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import { BEFORE_AFTER, SNIPPETS } from './signal-forms-intro.snippets';

export interface Registration {
  name: string;
  email: string;
  age: number | null;
  newsletter: boolean;
}

export const EMPTY_REGISTRATION: Registration = {
  name: '',
  email: '',
  age: null,
  newsletter: false,
};

/** Video 001 – Signal Forms: Getting Started. Model first, form() wraps it, [formField] binds it. */
@Component({
  selector: 'app-signal-forms-intro-page',
  imports: [
    DemoPage,
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    StateInspector,
  ],
  templateUrl: './signal-forms-intro.page.html',
})
export class SignalFormsIntroPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;

  // 1. Model first: the data lives in a plain signal.
  readonly model = signal<Registration>({ ...EMPTY_REGISTRATION });

  // 2. form() wraps the signal, the schema holds the validation rules.
  readonly registration = form(this.model, (path) => {
    required(path.name, { message: 'Please tell us your name.' });
    required(path.email, { message: 'Email is required.' });
    email(path.email, { message: 'That does not look like an email address.' });
    required(path.age, { message: 'Age is required.' });
    min(path.age, 18, { message: 'You must be at least 18 years old.' });
  });

  // 3. Everything is a signal – derived UI state is just computed().
  readonly flags = computed(() => {
    const state = this.registration();
    return {
      valid: state.valid(),
      invalid: state.invalid(),
      dirty: state.dirty(),
      touched: state.touched(),
    };
  });

  readonly errorCount = computed(() => this.registration().errorSummary().length);

  /** Model → form is synchronous: writing the signal updates every bound control. */
  fillExample(): void {
    this.model.set({ name: 'Ada Lovelace', email: 'ada@example.com', age: 36, newsletter: true });
  }

  reset(): void {
    this.model.set({ ...EMPTY_REGISTRATION });
    this.registration().reset();
  }
}
