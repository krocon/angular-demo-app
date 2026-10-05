import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['tips.models.ts', 'Tip 1: typed models and a derived payload type.'],
  ['tips-and-tricks.page.ts', 'Tips 2–5: schema logic, async debounce, submit(), computed flags.'],
  'tips-and-tricks.page.html',
]);
