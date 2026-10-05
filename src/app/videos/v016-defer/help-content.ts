import { Component, inject } from '@angular/core';
import { DeferLog } from './defer-log';

@Component({
  selector: 'app-help-content',
  template: `
    <dl>
      <dt>When is the chunk fetched?</dt>
      <dd>Prefetched while the browser is idle, rendered on hover – it appears instantly.</dd>
      <dt>What does &#64;placeholder do?</dt>
      <dd>It is shown until the trigger fires and is part of the main chunk.</dd>
      <dt>And &#64;loading?</dt>
      <dd>Shown while the chunk downloads; "after" and "minimum" avoid flicker.</dd>
    </dl>
  `,
  styles: `
    dt {
      font: var(--mat-sys-title-small);
    }
    dd {
      margin: 0 0 8px;
    }
  `,
})
export class HelpContent {
  constructor() {
    inject(DeferLog).loaded('HelpContent (on hover, prefetch on idle)');
  }
}
