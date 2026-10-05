import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'app.config.ts',
    'withViewTransitions({ onViewTransitionCreated }) – one switch on provideRouter.',
  ],
  [
    'styles/view-transitions.scss',
    'Duration/easing in GLOBAL styles: pseudo-elements ignore view encapsulation.',
  ],
  ['product-grid.ts', 'Tile with [style.view-transition-name]="\'product-\' + id".'],
  ['product-detail.ts', 'Detail header with the same name → the browser morphs between them.'],
  [
    'view-transition-settings.store.ts',
    'skipTransition() when disabled or reduced motion is preferred.',
  ],
  'view-transitions.routes.ts',
  'view-transitions.page.ts',
]);
