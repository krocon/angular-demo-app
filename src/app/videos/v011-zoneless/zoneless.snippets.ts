import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'app.config.ts',
    'provideZonelessChangeDetection() – the default since v21, set explicitly here.',
  ],
  ['angular.json (build options – no polyfills)', 'No "polyfills": ["zone.js"] entry.'],
  ['counters.ts', 'Plain field vs. signal, both changed by setInterval.'],
  ['zoneless.page.ts', 'afterEveryRender counts application renders.'],
]);
