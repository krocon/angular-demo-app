import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { EMPTY_SIGN_UP, RESERVED_WORDS, SignUp, signUpSchema } from './validation.rules';
import { BEFORE_AFTER, SNIPPETS } from './validation.snippets';

/** Video 002 – Validation patterns: built-ins, when, cross-field, custom rules, validateHttp. */
@Component({
  selector: 'app-validation-page',
  imports: [
    DemoPage,
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MetricTile,
  ],
  templateUrl: './validation.page.html',
  styleUrl: './validation.page.scss',
})
export class ValidationPage {
  readonly #log = inject(RequestLogStore);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly reserved = RESERVED_WORDS.join(', ');

  readonly debounceMs = signal(400);
  readonly model = signal<SignUp>({ ...EMPTY_SIGN_UP });
  readonly signUp = form(this.model, signUpSchema(this.debounceMs));

  readonly #usernameChecks = computed(() =>
    this.#log.entries().filter((e) => e.url.includes('/api/usernames/')),
  );
  readonly requestsSent = computed(() => this.#usernameChecks().length);
  readonly requestsCancelled = computed(
    () => this.#usernameChecks().filter((e) => e.cancelled).length,
  );
  readonly keystrokes = signal(0);

  readonly handleStatus = computed(() => {
    const handle = this.signUp.handle();
    if (handle.pending()) return 'Checking…';
    if (handle.invalid()) return handle.errors()[0]?.message ?? 'Invalid';
    return handle.value() ? 'Available' : '';
  });

  onHandleInput(): void {
    this.keystrokes.update((n) => n + 1);
  }

  validateAll(): void {
    this.signUp().markAsTouched();
  }

  reset(): void {
    this.model.set({ ...EMPTY_SIGN_UP });
    this.signUp().reset();
    this.keystrokes.set(0);
  }
}
