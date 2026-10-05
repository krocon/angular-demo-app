import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['look-and-feel.page.scss', 'mat.button-overrides() – the official way to restyle a component.'],
  ['theme-playground.scss', 'Density and font variants: mat.theme() per class, loaded on demand.'],
  ['look-and-feel.page.ts', 'Token values as signals → [style] on the preview container only.'],
  'theme-tokens.ts',
  'look-and-feel.page.html',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'brand.component.scss',
    `
// Fighting the component's internal DOM …
:host ::ng-deep .mat-mdc-button-base.mat-mdc-unelevated-button {
  background-color: #6750a4 !important;
  border-radius: 6px !important;
  text-transform: uppercase !important;
}

:host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading {
  border-radius: 4px 0 0 4px !important;
}
// … and breaking with every Material update.
`,
    '::ng-deep + !important: depends on internal class names.',
  ),
  after: snippet(
    'brand.scss',
    `
@use '@angular/material' as mat;

:root {
  --mat-sys-primary: #6750a4;      // system token
  --mat-sys-corner-small: 6px;
}

.brand-buttons {
  @include mat.button-overrides((
    filled-container-shape: 6px,
    filled-label-text-transform: uppercase,
  ));
}
`,
    'Tokens + official override mixins: stable API, no specificity wars.',
  ),
};
