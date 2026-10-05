import { Component, computed, input, output } from '@angular/core';
import { TableComponent } from '@guiexpert/angular-table';
import { TableFactory, TableOptions } from '@guiexpert/table';
import { BigColumn, BigRow } from './big-table.data';

/**
 * Optional 4th mode: GUI Expert Table (MIT) virtualizes rows AND columns.
 * Loaded via @defer, so the library (incl. its own styles) is a separate lazy chunk.
 */
@Component({
  selector: 'app-guiexpert-table-mode',
  imports: [TableComponent],
  template: `<guiexpert-table
    class="table"
    [tableModel]="model()"
    [tableOptions]="options"
    (tableReady)="ready.emit()"
  />`,
  styles: `
    :host {
      display: block;
      height: 480px;
      /* Map the table's CSS variables to Material tokens → follows light/dark. */
      --ge-table-bg: var(--mat-sys-surface);
      --ge-table-header-center-bg: var(--mat-sys-surface-container-high);
      --ge-table-header-center-text: var(--mat-sys-on-surface);
      --ge-table-body-center-bg: var(--mat-sys-surface);
      --ge-table-body-center-text: var(--mat-sys-on-surface);
      --ge-table-body-center-horizontal-border: var(--mat-sys-outline-variant);
      --ge-table-body-center-vertical-border: var(--mat-sys-outline-variant);
      --ge-table-header-center-horizontal-border: var(--mat-sys-outline-variant);
      --ge-table-header-center-vertical-border: var(--mat-sys-outline-variant);
      --ge-table-border: var(--mat-sys-outline-variant);
      --ge-table-hover-row-bg: var(--mat-sys-primary-container);
    }
    .table {
      display: block;
      height: 100%;
    }
  `,
})
export class GuiExpertTableMode {
  readonly rows = input.required<readonly BigRow[]>();
  readonly columns = input.required<readonly { key: BigColumn; label: string }[]>();
  readonly ready = output<void>();

  readonly options = { ...new TableOptions(), hoverColumnVisible: false };

  readonly model = computed(() => {
    const columns = this.columns();
    return TableFactory.createTableModel({
      headerData: [columns.map((c) => c.label)],
      bodyData: this.rows().map((row) => columns.map((c) => row[c.key])),
      columnSizes: columns.map((c) => (c.key === 'email' || c.key === 'name' ? 200 : 130)),
    });
  });
}
