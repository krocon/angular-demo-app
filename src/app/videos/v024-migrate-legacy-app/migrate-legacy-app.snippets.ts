import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['upgrade-plan.ts', 'One ng update per major + the verified migration schematics.'],
  'migrate-legacy-app.page.ts',
  'migrate-legacy-app.page.html',
]);
