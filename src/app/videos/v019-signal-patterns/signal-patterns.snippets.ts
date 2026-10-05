import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'signal-patterns.page.ts',
    'computed, linkedSignal, equal, effect, resource stream, debounced vs. throttleTime.',
  ],
  ['ticker-socket.ts', 'A simulated WebSocket bridged into a resource `stream`.'],
  ['pattern-advisor.ts', 'The decision helper.'],
  'signal-patterns.page.html',
]);
