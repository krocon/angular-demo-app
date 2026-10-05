/**
 * Global test setup for Vitest/jsdom. jsdom has no IntersectionObserver, which `@defer (on viewport)`
 * uses – a no-op stub keeps such blocks in their placeholder state, like an element off-screen.
 */
class NoopIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds: readonly number[] = [];
  observe(): void {
    // never intersects in jsdom
  }
  unobserve(): void {
    // nothing to do
  }
  disconnect(): void {
    // nothing to do
  }
  takeRecords(): [] {
    return [];
  }
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: NoopIntersectionObserver,
    writable: true,
  });
}
