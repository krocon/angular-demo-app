import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'reactive-order-form.ts',
    'Before: FormBuilder, nested group, valueChanges + takeUntilDestroyed.',
  ],
  ['signal-order-form.ts', 'After: interface + signal + form() + computed().'],
  'order.ts',
  'migration-old-vs-new.page.ts',
]);

const before = SOURCES['reactive-order-form.ts'] ?? '';
const after = SOURCES['signal-order-form.ts'] ?? '';

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet('reactive-order-form.ts', before, 'The running Reactive Forms version.'),
  after: snippet('signal-order-form.ts', after, 'The running Signal Forms version.'),
};
