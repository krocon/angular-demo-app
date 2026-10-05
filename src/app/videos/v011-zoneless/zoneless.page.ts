import { Component, ElementRef, afterEveryRender, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { PlainCounter, SignalCounter } from './counters';
import { SNIPPETS } from './zoneless.snippets';

export function isZoneLoaded(): boolean {
  return typeof (globalThis as { Zone?: unknown }).Zone !== 'undefined';
}

/** Video 011 – Zoneless Angular: what really triggers rendering without zone.js? */
@Component({
  selector: 'app-zoneless-page',
  imports: [DemoPage, MatButtonModule, MatIconModule, PlainCounter, SignalCounter],
  templateUrl: './zoneless.page.html',
  styleUrl: './zoneless.page.scss',
})
export class ZonelessPage {
  readonly snippets = SNIPPETS;
  readonly zoneLoaded = isZoneLoaded();
  readonly running = signal(true);

  readonly renderOutput = viewChild.required<ElementRef<HTMLElement>>('renders');
  #appRenders = 0;

  constructor() {
    // Runs after every application render. Writing the DOM directly (write phase) avoids
    // triggering yet another render – a signal here would loop.
    afterEveryRender({
      write: () => {
        this.#appRenders++;
        this.renderOutput().nativeElement.textContent = String(this.#appRenders);
      },
    });
  }

  get appRenders(): number {
    return this.#appRenders;
  }
}
