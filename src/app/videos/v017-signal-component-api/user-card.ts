import {
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Projected into <app-user-card> and counted with contentChildren(). */
@Directive({ selector: '[appTag]', host: { class: 'tag' } })
export class TagDirective {
  readonly appTag = input.required<string>();
}

/** The child: every part of its public API is a signal. */
@Component({
  selector: 'app-user-card',
  imports: [MatButtonModule, MatIconModule],
  host: { '[class.highlighted]': 'highlighted()' },
  template: `
    <div class="head">
      <span class="avatar" aria-hidden="true">{{ initials() }}</span>
      <div>
        <strong>{{ name() }}</strong>
        <small>{{ tags().length }} tag(s) projected</small>
      </div>
    </div>
    <div class="tags"><ng-content /></div>
    <label class="note">
      Note
      <input #nameInput type="text" placeholder="Focus me via viewChild()" />
    </label>
    <div class="stars" role="group" aria-label="Rating">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <button
          mat-icon-button
          type="button"
          (click)="rating.set(star)"
          [attr.aria-label]="'Rate ' + star"
          [attr.aria-pressed]="rating() >= star"
        >
          <mat-icon>{{ rating() >= star ? 'star' : 'star_outline' }}</mat-icon>
        </button>
      }
    </div>
    <button mat-flat-button type="button" (click)="selected.emit(name())">Select</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      border-radius: var(--mat-sys-corner-large);
      border: 2px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
    }
    :host(.highlighted) {
      border-color: var(--mat-sys-primary);
      box-shadow: 0 0 0 4px var(--mat-sys-primary-container);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .head small {
      display: block;
      color: var(--mat-sys-on-surface-variant);
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-weight: 700;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .note {
      display: flex;
      flex-direction: column;
      font: var(--mat-sys-label-medium);
    }
    .note input {
      padding: 6px 8px;
      border: 1px solid var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-small);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }
    .stars mat-icon {
      color: var(--app-status-preview);
    }
  `,
})
export class UserCard {
  // Inputs – checked by the compiler, readable as signals.
  readonly name = input.required<string>();
  readonly highlighted = input(false, { transform: booleanAttribute });
  // Output – replaces EventEmitter, emit() is unchanged.
  readonly selected = output<string>();
  // Two-way binding: [(rating)]
  readonly rating = model(0);
  // Derived state instead of ngOnChanges.
  readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2),
  );
  // Queries as signals – no ngAfterViewInit timing issues.
  readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  readonly tags = contentChildren(TagDirective);

  focusInput(): void {
    this.nameInput().nativeElement.focus();
  }
}
