import { ResourceSnapshot, Signal, linkedSignal } from '@angular/core';

/**
 * Turns a snapshot stream into one that keeps the last value while loading:
 * `loading` becomes `reloading` with the previous value → no flicker.
 */
export function keepPreviousValue<T>(
  source: Signal<ResourceSnapshot<T>>,
): Signal<ResourceSnapshot<T>> {
  return linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source,
    computation: (snapshot, previous) => {
      if (
        snapshot.status === 'loading' &&
        previous &&
        'value' in previous.value &&
        previous.value.value !== undefined
      ) {
        return { status: 'reloading', value: previous.value.value };
      }
      return snapshot;
    },
  });
}

/** Readable form of a snapshot for the inspector (Error objects don't stringify). */
export function describeSnapshot<T>(snapshot: ResourceSnapshot<T>): unknown {
  return snapshot.status === 'error'
    ? { status: snapshot.status, error: snapshot.error.message }
    : { status: snapshot.status, value: snapshot.value };
}
