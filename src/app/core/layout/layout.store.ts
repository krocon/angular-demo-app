import { BreakpointObserver } from '@angular/cdk/layout';
import { Service, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const HANDSET_QUERY = '(max-width: 959.98px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Breakpoints as signals (BreakpointObserver → toSignal). */
@Service()
export class LayoutStore {
  readonly #breakpoints = inject(BreakpointObserver);

  readonly isHandset = toSignal(
    this.#breakpoints.observe(HANDSET_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.#breakpoints.isMatched(HANDSET_QUERY) },
  );

  readonly prefersReducedMotion = toSignal(
    this.#breakpoints.observe(REDUCED_MOTION_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.#breakpoints.isMatched(REDUCED_MOTION_QUERY) },
  );

  readonly sidenavMode = computed(() => (this.isHandset() ? 'over' : 'side'));
}
