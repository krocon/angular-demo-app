import { Component, Signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { map } from 'rxjs';

export interface HasUnsavedChanges {
  readonly hasUnsavedChanges: Signal<boolean>;
}

@Component({
  selector: 'app-confirm-discard-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Discard unsaved changes?</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false" cdkFocusInitial>Stay</button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">Discard &amp; leave</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDiscardDialog {
  readonly data = inject<{ message: string }>(MAT_DIALOG_DATA);
}

/** Functional guard – inject() works here too. Asks before leaving while the form is dirty. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  return inject(MatDialog)
    .open(ConfirmDiscardDialog, {
      data: { message: 'Your profile has changes that are not saved yet.' },
      width: '420px',
    })
    .afterClosed()
    .pipe(map((discard) => discard === true));
};
