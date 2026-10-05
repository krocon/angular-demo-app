import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { domNodeCount } from '../../shared/utils/dom';
import { injectFpsMeter } from '../../shared/utils/fps-meter';
import {
  ALL_COLUMNS,
  BigColumn,
  BigRow,
  SortDirection,
  filterRows,
  generateRows,
  sortRows,
} from './big-table.data';
import { SNIPPETS } from './big-tables.snippets';
import { FreezeWarningDialog } from './freeze-warning.dialog';
import { GuiExpertTableMode } from './guiexpert-table-mode';

export type TableMode = 'plain' | 'paged' | 'virtual' | 'gui';
export const PLAIN_WARN_THRESHOLD = 10_000;
export const ROW_HEIGHT = 36;

/** Video 009 – Big tables: DOM nodes = rows × columns. Plain vs. paginated vs. virtual. */
@Component({
  selector: 'app-big-tables-page',
  imports: [
    DemoPage,
    GuiExpertTableMode,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MetricTile,
    ScrollingModule,
  ],
  templateUrl: './big-tables.page.html',
  styleUrl: './big-tables.page.scss',
})
export class BigTablesPage {
  readonly #dialog = inject(MatDialog);
  readonly #injector = inject(Injector);
  readonly snippets = SNIPPETS;
  readonly rowOptions = [100, 1_000, 10_000, 100_000];
  readonly rowHeight = ROW_HEIGHT;

  readonly rowCount = signal(1_000);
  readonly columnCount = signal<5 | 10>(5);
  readonly mode = signal<TableMode>('virtual');

  readonly rows = computed(() => generateRows(this.rowCount()));
  readonly columns = computed(() => ALL_COLUMNS.slice(0, this.columnCount()));
  readonly columnKeys = computed(() => this.columns().map((c) => c.key));
  readonly gridTemplate = computed(() => `repeat(${this.columnCount()}, minmax(110px, 1fr))`);

  // Virtual mode: sorting and filtering are on you – here as computed().
  readonly filter = signal('');
  readonly sortKey = signal<BigColumn>('id');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly virtualRows = computed(() =>
    sortRows(filterRows(this.rows(), this.filter()), this.sortKey(), this.sortDirection()),
  );

  // Paged mode: MatTableDataSource + paginator + sort.
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);
  readonly dataSource = computed(() => new MatTableDataSource<BigRow>(this.rows()));

  readonly modeGroup = viewChild('modeGroup', { read: MatButtonToggleGroup });
  readonly host = viewChild.required<ElementRef<HTMLElement>>('tableHost');
  readonly domNodes = signal(0);
  readonly renderMs = signal(0);
  readonly fps = injectFpsMeter();
  #changeStarted = performance.now();

  constructor() {
    effect(() => {
      const ds = this.dataSource();
      ds.paginator = this.paginator() ?? null;
      ds.sort = this.sort() ?? null;
    });
    // Re-measure after every structural change.
    effect(() => {
      this.mode();
      this.rows();
      this.columnCount();
      this.virtualRows();
      untracked(() => this.measureAfterRender());
    });
    afterNextRender(() => this.fps.start());
  }

  measureAfterRender(): void {
    afterNextRender(
      {
        read: () => {
          this.domNodes.set(domNodeCount(this.host().nativeElement));
          this.renderMs.set(Math.round(performance.now() - this.#changeStarted));
        },
      },
      { injector: this.#injector },
    );
  }

  async setRows(count: number): Promise<void> {
    if (await this.#confirmPlain(this.mode(), count)) {
      this.#changeStarted = performance.now();
      this.rowCount.set(count);
    }
  }

  async setMode(mode: TableMode): Promise<void> {
    if (await this.#confirmPlain(mode, this.rowCount())) {
      this.#changeStarted = performance.now();
      this.mode.set(mode);
    } else {
      // keep the toggle group in sync with the unchanged mode
      const group = this.modeGroup();
      if (group) group.value = this.mode();
    }
  }

  setColumns(count: 5 | 10): void {
    this.#changeStarted = performance.now();
    this.columnCount.set(count);
  }

  readonly trackById = (_: number, row: BigRow): number => row.id;

  toggleSort(key: BigColumn): void {
    if (this.sortKey() === key) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  async #confirmPlain(mode: TableMode, rows: number): Promise<boolean> {
    if (mode !== 'plain' || rows <= PLAIN_WARN_THRESHOLD) {
      return true;
    }
    const ref = this.#dialog.open(FreezeWarningDialog, { data: { rows }, width: '440px' });
    return new Promise((resolve) => ref.afterClosed().subscribe((ok) => resolve(ok === true)));
  }
}
