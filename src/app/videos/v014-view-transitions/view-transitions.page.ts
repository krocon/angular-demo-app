import { Component, DOCUMENT, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { RouterOutlet } from '@angular/router';
import { ViewTransitionSettingsStore } from '../../core/view-transitions/view-transition-settings.store';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { ProductStore } from './product.store';
import { SNIPPETS } from './view-transitions.snippets';

export const EASINGS = [
  { label: 'Emphasized', value: 'cubic-bezier(0.2, 0, 0, 1)' },
  { label: 'Ease in-out', value: 'ease-in-out' },
  { label: 'Linear', value: 'linear' },
  { label: 'Bounce-ish', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
] as const;

/** Video 014 – View transitions: router crossfade + element morphing with view-transition-name. */
@Component({
  selector: 'app-view-transitions-page',
  imports: [
    DemoPage,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    RouterOutlet,
  ],
  providers: [ProductStore],
  templateUrl: './view-transitions.page.html',
  styleUrl: './view-transitions.page.scss',
})
export class ViewTransitionsPage {
  readonly settings = inject(ViewTransitionSettingsStore);
  readonly snippets = SNIPPETS;
  readonly easings = EASINGS;
  readonly duration = signal(400);
  readonly easing = signal<string>(EASINGS[0].value);

  constructor() {
    const root = inject(DOCUMENT).documentElement;
    // Durations live in GLOBAL styles (styles/view-transitions.scss) – we only feed variables.
    effect(() => {
      root.style.setProperty('--app-vt-duration', `${this.duration()}ms`);
      root.style.setProperty('--app-vt-easing', this.easing());
    });
    inject(DestroyRef).onDestroy(() => {
      root.style.removeProperty('--app-vt-duration');
      root.style.removeProperty('--app-vt-easing');
    });
  }
}
