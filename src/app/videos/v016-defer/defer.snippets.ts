import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['defer.page.html', 'Four triggers: viewport, interaction, hover + prefetch on idle, when.'],
  ['defer.page.ts', 'The deferred components are imported, but only used inside @defer.'],
  'heavy-chart.ts',
  'defer-log.ts',
]);
