import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['resource.page.ts', 'Three implementations, one UI: resource, rxResource, httpResource.'],
  [
    'user-api.ts',
    'Reads return Observables; abortable() wires the AbortSignal; writes use post().',
  ],
  'resource.page.html',
]);
