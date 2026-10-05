import { EnvironmentInjector, Service, inject } from '@angular/core';

/**
 * Snackbar facade that loads MatSnackBar (and the CDK overlay) on first use, keeping both
 * out of the initial bundle. Resolves to `true` when the action button was clicked.
 */
@Service()
export class Notifier {
  readonly #injector = inject(EnvironmentInjector);

  async open(message: string, action?: string, duration = 3000): Promise<boolean> {
    const { MatSnackBar } = await import('@angular/material/snack-bar');
    const ref = this.#injector.get(MatSnackBar).open(message, action, { duration });
    return new Promise<boolean>((resolve) =>
      ref.afterDismissed().subscribe(({ dismissedByAction }) => resolve(dismissedByAction)),
    );
  }
}
