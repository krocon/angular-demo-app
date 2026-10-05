import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['big-tables.page.html', 'Four rendering modes over the same data.'],
  [
    'big-tables.page.ts',
    'Signals for rows/columns/mode, computed sort + filter, DOM metrics after render.',
  ],
  ['big-table.data.ts', 'Deterministic data, sort and filter helpers.'],
  ['guiexpert-table-mode.ts', 'Optional: GUI Expert Table, loaded via @defer.'],
]);
