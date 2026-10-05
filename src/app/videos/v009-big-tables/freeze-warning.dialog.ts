import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-freeze-warning-dialog',
  imports: [DecimalPipe, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>This may freeze your tab</h2>
    <mat-dialog-content>
      A plain table with {{ data.rows | number }} rows creates millions of DOM nodes. Rendering can
      take several seconds.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false" cdkFocusInitial>Cancel</button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">Render anyway</button>
    </mat-dialog-actions>
  `,
})
export class FreezeWarningDialog {
  readonly data = inject<{ rows: number }>(MAT_DIALOG_DATA);
}
