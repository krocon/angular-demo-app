import { Component, computed, input, model, output } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

/** A tag editor on top of mat-chip-grid – a FormValueControl<string[]>. */
@Component({
  selector: 'app-tag-input',
  imports: [MatChipsModule, MatFormFieldModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="field">
      <mat-label>{{ label() }}</mat-label>
      <mat-chip-grid #grid [disabled]="disabled()" [attr.aria-label]="label()">
        @for (tag of value(); track tag) {
          <mat-chip-row (removed)="remove(tag)">
            {{ tag }}
            <button matChipRemove type="button" [attr.aria-label]="'Remove ' + tag">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
        <input
          placeholder="Add a tag and press Enter…"
          [matChipInputFor]="grid"
          (matChipInputTokenEnd)="add($event)"
          (blur)="touch.emit()"
        />
      </mat-chip-grid>
      <mat-hint>{{ value().length }} tag(s)</mat-hint>
    </mat-form-field>
    @if (showErrors()) {
      <span class="error" role="alert">{{ errors()[0]?.message }}</span>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .field {
      width: 100%;
    }
    .error {
      display: block;
      margin-top: 4px;
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
    }
  `,
})
export class TagInput implements FormValueControl<string[]> {
  readonly value = model<string[]>([]);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touch = output<void>();
  readonly label = input('Tags');

  readonly showErrors = computed(() => this.touched() && this.invalid());

  add(event: MatChipInputEvent): void {
    const tag = event.value.trim().toLowerCase();
    if (tag && !this.value().includes(tag)) {
      this.value.update((tags) => [...tags, tag]);
    }
    event.chipInput.clear();
  }

  remove(tag: string): void {
    this.value.update((tags) => tags.filter((t) => t !== tag));
    this.touch.emit();
  }
}
