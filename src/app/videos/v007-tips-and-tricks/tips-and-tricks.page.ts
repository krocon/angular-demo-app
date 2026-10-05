import { HttpContext } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  disabled,
  email,
  form,
  hidden,
  minLength,
  readonly,
  required,
  submit,
  validateHttp,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import { SNIPPETS } from './tips-and-tricks.snippets';
import { Checkout, Contact, Customer, Newsletter, Signup, toPayload } from './tips.models';

export const ASYNC_DEBOUNCE_MS = 600;

/** Video 007 – Signal Forms: 5 pro tips, each as a mini demo. */
@Component({
  selector: 'app-tips-and-tricks-page',
  imports: [
    DemoPage,
    EventLog,
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MetricTile,
    StateInspector,
  ],
  templateUrl: './tips-and-tricks.page.html',
  styleUrl: './tips-and-tricks.page.scss',
})
export class TipsAndTricksPage {
  readonly #requestLog = inject(RequestLogStore);
  readonly snippets = SNIPPETS;

  // Tip 1 – typed model
  readonly customerModel = signal<Customer>({ name: 'Ada', email: 'ada@example.com' });
  readonly customer = form(this.customerModel, (path) => {
    required(path.name);
    email(path.email);
  });
  readonly payload = computed(() => toPayload(this.customerModel()));

  // Tip 2 – disabled / readonly / hidden in the schema
  readonly checkoutModel = signal<Checkout>({
    billingName: 'Ada Lovelace',
    differentShipping: false,
    shipping: { street: '', city: '', country: 'Germany' },
    express: false,
  });
  readonly checkout = form(this.checkoutModel, (path) => {
    required(path.billingName);
    required(path.shipping.street, { message: 'Street is required.' });
    required(path.shipping.city, { message: 'City is required.' });
    hidden(path.shipping, { when: ({ valueOf }) => !valueOf(path.differentShipping) });
    readonly(path.shipping.country, { when: () => true });
    disabled(path.express, {
      when: ({ valueOf }) =>
        valueOf(path.differentShipping) ? false : 'Express needs a shipping address.',
    });
  });

  // Tip 3 – debounce only the async validator
  readonly signupModel = signal<Signup>({ username: '' });
  readonly signup = form(this.signupModel, (path) => {
    required(path.username, { message: 'Required – checked on every keystroke.' });
    minLength(path.username, 3, { message: 'At least 3 characters.' });
    validateHttp(path.username, {
      request: ({ value }) => ({
        url: `/api/usernames/${encodeURIComponent(value())}/available`,
        context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
      }),
      debounce: ASYNC_DEBOUNCE_MS,
      onSuccess: (r: { available: boolean }) =>
        r.available ? null : { kind: 'taken', message: 'Username is taken.' },
      onError: () => ({ kind: 'unreachable', message: 'Could not check.' }),
    });
  });
  readonly keystrokes = signal(0);
  readonly asyncChecks = computed(
    () => this.#requestLog.entries().filter((e) => e.url.includes('/api/usernames/')).length,
  );

  // Tip 4 – submit()
  readonly contactModel = signal<Contact>({ name: '', email: '', message: '' });
  readonly contact = form(this.contactModel, (path) => {
    required(path.name, { message: 'Name is required.' });
    required(path.email, { message: 'Email is required.' });
    email(path.email, { message: 'Invalid email.' });
    minLength(path.message, 10, { message: 'At least 10 characters.' });
  });
  readonly submitLog = new EventLogBuffer();

  // Tip 5 – UI flags in computed(), not in the model
  readonly newsletterModel = signal<Newsletter>({ email: '' });
  readonly newsletter = form(this.newsletterModel, (path) => {
    required(path.email);
    email(path.email);
  });
  readonly isSaving = signal(false);
  readonly canSubmit = computed(() => this.newsletter().valid() && !this.isSaving());

  async sendContact(): Promise<void> {
    const sent = await submit(this.contact, {
      action: async (field) => {
        this.submitLog.log(`action() ran with ${JSON.stringify(field().value())}`);
        return undefined;
      },
      onInvalid: () =>
        this.submitLog.log(
          `blocked – ${this.contact().errorSummary().length} error(s), all fields touched`,
        ),
    });
    this.submitLog.log(`submit() resolved: ${sent}`);
  }

  async subscribe(): Promise<void> {
    if (!this.canSubmit()) return;
    this.isSaving.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    this.isSaving.set(false);
    this.newsletterModel.set({ email: '' });
    this.newsletter().reset();
  }
}
