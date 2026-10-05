import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['angular.json (budgets)', 'Budgets fail the build when exceeded.'],
  [
    'package.json (scripts)',
    'analyze → stats.json for the esbuild analyzer; analyze:sme → source-map-explorer.',
  ],
  ['bundle-optimization.page.ts', 'import() on demand.'],
  ['intl-formats.ts', 'Intl instead of moment/numeral.'],
  'heavy-module.ts',
]);
