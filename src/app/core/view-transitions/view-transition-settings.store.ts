import { DOCUMENT, Service, inject, signal } from '@angular/core';
import { ViewTransitionInfo } from '@angular/router';

/** Runtime switches for router view transitions (video 014). */
@Service()
export class ViewTransitionSettingsStore {
  readonly #document = inject(DOCUMENT);
  readonly enabled = signal(true);
  readonly created = signal(0);
  readonly skipped = signal(0);

  readonly supported = typeof this.#document.startViewTransition === 'function';

  readonly prefersReducedMotion =
    this.#document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  /** Called by `withViewTransitions({ onViewTransitionCreated })`. */
  onCreated(info: ViewTransitionInfo): void {
    this.created.update((n) => n + 1);
    if (!this.enabled() || this.prefersReducedMotion) {
      info.transition.skipTransition();
      this.skipped.update((n) => n + 1);
    }
  }
}
