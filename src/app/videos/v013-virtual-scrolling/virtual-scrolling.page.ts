import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
  Component,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { MetricTile } from '../../shared/metric-tile/metric-tile';
import { injectFpsMeter } from '../../shared/utils/fps-meter';
import { Person, PersonSort, filterPeople, generatePeople, sortPeople } from './people.data';
import { SNIPPETS } from './virtual-scrolling.snippets';

export const TOTAL = 100_000;

/** Video 013 – High-performance virtual scrolling with signals as the data source. */
@Component({
  selector: 'app-virtual-scrolling-page',
  imports: [
    DemoPage,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MetricTile,
    RouterLink,
    ScrollingModule,
  ],
  templateUrl: './virtual-scrolling.page.html',
  styleUrl: './virtual-scrolling.page.scss',
})
export class VirtualScrollingPage {
  readonly #injector = inject(Injector);
  readonly snippets = SNIPPETS;
  readonly total = TOTAL;

  readonly people = signal<readonly Person[]>(generatePeople(TOTAL));
  readonly query = signal('');
  readonly sort = signal<PersonSort>('id');

  // Signals as the data source: filter and sort are just computed().
  readonly visible = computed(() =>
    sortPeople(filterPeople(this.people(), this.query()), this.sort()),
  );

  readonly itemSize = signal(48);
  readonly minBufferPx = signal(200);
  readonly maxBufferPx = signal(400);
  /** maxBufferPx must never be smaller than minBufferPx. */
  readonly effectiveMaxBuffer = computed(() => Math.max(this.maxBufferPx(), this.minBufferPx()));

  readonly viewport = viewChild.required(CdkVirtualScrollViewport);
  readonly firstVisible = signal(0);
  readonly renderedRows = signal(0);
  readonly fps = injectFpsMeter();

  readonly trackById = (_: number, person: Person): number => person.id;

  constructor() {
    effect(() => {
      this.visible();
      this.itemSize();
      this.effectiveMaxBuffer();
      untracked(() => this.measure());
    });
    afterNextRender(() => this.fps.start());
  }

  onScrolledIndex(index: number): void {
    this.firstVisible.set(index);
    this.measure();
  }

  measure(): void {
    afterNextRender(
      {
        read: () =>
          this.renderedRows.set(
            this.viewport().elementRef.nativeElement.querySelectorAll('.vrow').length,
          ),
      },
      { injector: this.#injector },
    );
  }

  scrollTo(index: number): void {
    this.viewport().scrollToIndex(Math.min(index, this.visible().length - 1));
  }
}
