import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['todo.store.ts', 'The complete store: private signal, computed selectors, methods.'],
  ['todo-widget.ts', 'Same widget, two scopes – root vs. providers: [TodoStore].'],
  'signal-state.page.html',
]);
