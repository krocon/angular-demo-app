import { Service, computed, signal } from '@angular/core';

export const DEMO_TOKEN = 'demo-token-22';

@Service()
export class AuthStore {
  readonly #token = signal<string | null>(DEMO_TOKEN);
  readonly token = this.#token.asReadonly();
  readonly isLoggedIn = computed(() => this.#token() !== null);

  login(token = DEMO_TOKEN): void {
    this.#token.set(token);
  }

  logout(): void {
    this.#token.set(null);
  }
}
