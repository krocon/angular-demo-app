import { HttpContext, httpResource } from '@angular/common/http';
import { Component, computed, resourceFromSnapshots, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Company, User } from '../../core/fake-backend/fake-db';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import { describeSnapshot, keepPreviousValue } from './keep-previous';
import { BEFORE_AFTER, SNIPPETS } from './resource-composition.snippets';

const inline = () => new HttpContext().set(SKIP_ERROR_HANDLING, true);

/** Video 026 – Resource composition: chain() and snapshots. */
@Component({
  selector: 'app-resource-composition-page',
  imports: [
    DemoPage,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    StateInspector,
  ],
  templateUrl: './resource-composition.page.html',
  styleUrl: './resource-composition.page.scss',
})
export class ResourceCompositionPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;

  readonly userIds = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly userId = signal(1);

  // Step 1: the user.
  readonly user = httpResource<User>(() => ({
    url: `/api/users/${this.userId()}`,
    context: inline(),
  }));

  // Step 2: the company – chain() reads the user's value inside params. While the user loads,
  // the company waits; if the user fails, the company inherits the error.
  readonly company = httpResource<Company>(({ chain }) => {
    const user = chain(this.user); // typed User | undefined – httpResource values may be undefined
    return user ? { url: `/api/companies/${user.companyId}`, context: inline() } : undefined;
  });

  // Snapshots: status + value in one object. Keep the previous company while reloading.
  readonly keepPrevious = signal(true);
  readonly smoothCompany = resourceFromSnapshots(keepPreviousValue(this.company.snapshot));
  readonly shown = computed(() => (this.keepPrevious() ? this.smoothCompany : this.company));

  readonly userSnapshot = computed(() => describeSnapshot(this.user.snapshot()));
  readonly companySnapshot = computed(() => describeSnapshot(this.company.snapshot()));
  readonly smoothSnapshot = computed(() => describeSnapshot(this.smoothCompany.snapshot()));
}
