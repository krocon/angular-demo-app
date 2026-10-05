import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, debounceTime, filter, skip, switchMap, tap } from 'rxjs';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { BEFORE_AFTER, SNIPPETS } from './auto-save.snippets';
import { Profile, ProfileApi } from './profile.store';
import { HasUnsavedChanges } from './unsaved-changes.guard';

export const AUTO_SAVE_DEBOUNCE_MS = 500;

/** Video 006 – Auto-save & form state: dirty/valid as signals, debounce, reset, canDeactivate. */
@Component({
  selector: 'app-auto-save-page',
  imports: [
    DatePipe,
    DemoPage,
    EventLog,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    RouterLink,
  ],
  templateUrl: './auto-save.page.html',
  styleUrl: './auto-save.page.scss',
})
export class AutoSavePage implements HasUnsavedChanges {
  readonly #api = inject(ProfileApi);
  readonly #destroyRef = inject(DestroyRef);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
  ];
  readonly log = new EventLogBuffer();

  readonly model = signal<Profile>({
    displayName: 'Ada Lovelace',
    bio: 'First programmer.',
    language: 'en',
    notifications: true,
  });
  readonly profile = form(this.model, (path) => {
    required(path.displayName, { message: 'Display name is required.' });
    maxLength(path.bio, 160, { message: 'Max. 160 characters.' });
  });

  readonly autoSave = signal(true);
  readonly saving = signal(false);
  readonly failed = signal(false);
  readonly savedAt = signal<Date | null>(null);

  // dirty/valid are signals – the guard and the buttons just read them.
  readonly hasUnsavedChanges = computed(() => this.profile().dirty());
  readonly canSave = computed(
    () => this.profile().dirty() && this.profile().valid() && !this.saving(),
  );
  readonly status = computed(() => {
    if (this.saving()) return 'saving';
    if (this.failed()) return 'failed';
    if (this.profile().dirty()) return 'dirty';
    return this.savedAt() ? 'saved' : 'clean';
  });

  constructor() {
    // Auto-save: model → Observable → debounce → API. Cleaned up automatically.
    toObservable(this.model)
      .pipe(
        skip(1),
        filter(() => this.autoSave()),
        debounceTime(AUTO_SAVE_DEBOUNCE_MS),
        filter(() => this.profile().dirty() && this.profile().valid()),
        switchMap((value) => this.#save(value)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  saveNow(): void {
    this.#save(this.model()).pipe(takeUntilDestroyed(this.#destroyRef)).subscribe();
  }

  #save(value: Profile) {
    this.saving.set(true);
    this.failed.set(false);
    this.log.log(`PUT /api/profile ${JSON.stringify(value)}`);
    return this.#api.save(value).pipe(
      tap((saved) => {
        this.saving.set(false);
        this.savedAt.set(new Date(saved.savedAt));
        this.log.log('✓ saved');
        // Only reset when nothing changed while the request was in flight.
        if (JSON.stringify(this.model()) === JSON.stringify(value)) {
          this.profile().reset();
        }
      }),
      catchError(() => {
        this.saving.set(false);
        this.failed.set(true);
        this.log.log('✗ save failed');
        return EMPTY;
      }),
    );
  }
}
