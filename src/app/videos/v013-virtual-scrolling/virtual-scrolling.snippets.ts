import { fromSources } from '../../shared/code-viewer/code-snippet';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'virtual-scrolling.page.html',
    'cdk-virtual-scroll-viewport with itemSize / buffer inputs and trackBy.',
  ],
  ['virtual-scrolling.page.ts', 'Signals as the data source – filter and sort via computed().'],
  'people.data.ts',
]);
