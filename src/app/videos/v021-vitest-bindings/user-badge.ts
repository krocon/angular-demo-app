import { HttpContext, httpResource } from '@angular/common/http';
import { Component, computed, input } from '@angular/core';
import { User } from '../../core/fake-backend/fake-db';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';

/** Component under test with an httpResource – tested with HttpTestingController. */
@Component({
  selector: 'app-user-badge',
  template: `
    @switch (user.status()) {
      @case ('loading') {
        <span data-testid="state">Loading user {{ userId() }}…</span>
      }
      @case ('error') {
        <span data-testid="state" class="error">Could not load user {{ userId() }}</span>
      }
      @default {
        @if (user.value(); as u) {
          <span class="avatar" aria-hidden="true">{{ initial() }}</span>
          <span data-testid="name">{{ u.name }}</span>
        }
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
    .error {
      color: var(--mat-sys-error);
    }
  `,
})
export class UserBadge {
  readonly userId = input.required<number>();
  readonly user = httpResource<User>(() => ({
    url: `/api/users/${this.userId()}`,
    context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
  }));
  readonly initial = computed(() => this.user.value()?.name.charAt(0) ?? '?');
}
