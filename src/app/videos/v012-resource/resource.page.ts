import { httpResource } from '@angular/common/http';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { User } from '../../core/fake-backend/fake-db';
import { RequestLogStore } from '../../core/fake-backend/request-log.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { SNIPPETS } from './resource.snippets';
import { INLINE_ERRORS, UserApi, UserPage, UserQuery, abortable, toParams } from './user-api';

export type Implementation = 'resource' | 'rxResource' | 'httpResource';
export const PAGE_SIZE = 8;

/** Video 012 – Data fetching with resource(), rxResource() and httpResource(). */
@Component({
  selector: 'app-resource-page',
  imports: [
    DemoPage,
    FormField,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './resource.page.html',
  styleUrl: './resource.page.scss',
})
export class ResourcePage {
  readonly #api = inject(UserApi);
  readonly #log = inject(RequestLogStore);
  readonly snippets = SNIPPETS;

  readonly implementation = signal<Implementation>('resource');
  readonly q = signal('');
  readonly page = signal(1);
  readonly query = computed<UserQuery>(() => ({
    q: this.q(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));

  /** Only the selected implementation gets params – the others stay idle. */
  #paramsFor(impl: Implementation): UserQuery | undefined {
    return this.implementation() === impl ? this.query() : undefined;
  }

  // 1) resource(): Promise-based loader with an AbortSignal.
  readonly viaResource = resource({
    params: () => this.#paramsFor('resource'),
    loader: ({ params, abortSignal }) => abortable(this.#api.list(params), abortSignal),
  });

  // 2) rxResource(): Observable-based – unsubscribed automatically on param change.
  readonly viaRxResource = rxResource({
    params: () => this.#paramsFor('rxResource'),
    stream: ({ params }) => this.#api.list(params),
  });

  // 3) httpResource(): the shortest way for a simple GET.
  readonly viaHttpResource = httpResource<UserPage>(() => {
    const params = this.#paramsFor('httpResource');
    return params
      ? { url: '/api/users', params: toParams(params), context: INLINE_ERRORS() }
      : undefined;
  });

  readonly active = computed(() => {
    switch (this.implementation()) {
      case 'resource':
        return this.viaResource;
      case 'rxResource':
        return this.viaRxResource;
      default:
        return this.viaHttpResource;
    }
  });

  readonly users = computed(() =>
    this.active().hasValue() ? (this.active().value()?.items ?? []) : [],
  );
  readonly total = computed(() =>
    this.active().hasValue() ? (this.active().value()?.total ?? 0) : 0,
  );
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  readonly requests = computed(() =>
    this.#log
      .entries()
      .filter((e) => e.url.startsWith('/api/users'))
      .slice(0, 8),
  );

  // Create user – a write, so HttpClient.post, then reload() (optionally optimistic).
  readonly optimistic = signal(true);
  readonly newUser = signal({ name: '', email: '' });
  readonly newUserForm = form(this.newUser, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
  });
  readonly creating = signal(false);

  setQuery(q: string): void {
    this.q.set(q);
    this.page.set(1);
  }

  async createUser(): Promise<void> {
    if (!this.newUserForm().valid()) {
      this.newUserForm().markAsTouched();
      return;
    }
    const draft = this.newUser();
    const resourceRef = this.active();
    if (this.optimistic() && resourceRef.hasValue()) {
      const temp: User = { id: -1, role: 'Developer', companyId: 1, ...draft };
      resourceRef.value.update((page) => (page ? { ...page, items: [temp, ...page.items] } : page));
    }
    this.creating.set(true);
    try {
      await firstValueFrom(this.#api.create(draft));
      this.newUser.set({ name: '', email: '' });
      this.newUserForm().reset();
    } finally {
      this.creating.set(false);
      resourceRef.reload();
    }
  }
}
