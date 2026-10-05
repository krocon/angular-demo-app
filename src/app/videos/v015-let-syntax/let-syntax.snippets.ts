import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'let-syntax.page.html',
    '@let subtotal / tax / total / isFreeShipping – each computed once, used many times.',
  ],
  'let-syntax.page.ts',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'cart.before.html',
    `
<!-- repeated expressions … -->
<dd>{{ getSubtotal() | currency }}</dd>
<dd>{{ getSubtotal() * taxRate | currency }}</dd>
<dd>{{ getSubtotal() + getSubtotal() * taxRate | currency }}</dd>
<p *ngIf="getSubtotal() >= 100">Free shipping!</p>

<!-- … and the *ngIf "as" trick to name an async value -->
<ng-container *ngIf="price$ | async as ticker">
  NG/EUR {{ ticker }}  <!-- never shown when the value is 0! -->
</ng-container>
`,
    'Repeated calls in the template and *ngIf … as as a naming workaround.',
  ),
  after: snippet(
    'cart.after.html',
    `
@let subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
@let tax = subtotal * taxRate;
@let isFreeShipping = subtotal >= 100;

<dd>{{ subtotal | currency }}</dd>
<dd>{{ tax | currency }}</dd>
<dd>{{ subtotal + tax | currency }}</dd>
@if (isFreeShipping) { <p>Free shipping!</p> }

@let ticker = price$ | async;
NG/EUR {{ ticker }}
`,
    'Name it once with @let – read-only, block-scoped, always up to date.',
  ),
};
