import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { VIDEO_CATALOG } from '../../core/catalog/video-catalog';
import { VideoEntry, videoLink } from '../../core/catalog/video.model';
import { ApiStatusChip } from '../api-status-chip/api-status-chip';
import { BeforeAfter } from '../before-after/before-after';
import { CodeSnippet } from '../code-viewer/code-snippet';
import { CodeViewer } from '../code-viewer/code-viewer';

export interface BeforeAfterPair {
  readonly before: CodeSnippet;
  readonly after: CodeSnippet;
}

export type DemoTab = 'demo' | 'code' | 'before-after';

/**
 * Shared layout for every video page: header, key points, tabs (Live demo / Code /
 * Before-After, synced with `?tab=`), takeaway banner and prev/next navigation.
 * The live demo is projected as default content.
 */
@Component({
  selector: 'app-demo-page',
  imports: [
    ApiStatusChip,
    BeforeAfter,
    CodeViewer,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.scss',
})
export class DemoPage {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  /** Video number, e.g. `'012'`. */
  readonly num = input.required<string>();
  readonly snippets = input<readonly CodeSnippet[]>([]);
  readonly beforeAfter = input<BeforeAfterPair | null>(null);

  readonly #index = computed(() => VIDEO_CATALOG.findIndex((v) => v.num === this.num()));
  readonly video = computed<VideoEntry>(() => {
    const video = VIDEO_CATALOG[this.#index()];
    if (!video) {
      throw new Error(`Unknown video ${this.num()}`);
    }
    return video;
  });
  readonly prev = computed(() => VIDEO_CATALOG[this.#index() - 1]);
  readonly next = computed(() => VIDEO_CATALOG[this.#index() + 1]);

  readonly tabs = computed<readonly DemoTab[]>(() =>
    this.beforeAfter() ? ['demo', 'code', 'before-after'] : ['demo', 'code'],
  );
  readonly #tabParam = toSignal(this.#route.queryParamMap.pipe(map((p) => p.get('tab'))), {
    initialValue: null,
  });
  readonly selectedIndex = computed(() =>
    Math.max(0, this.tabs().indexOf((this.#tabParam() ?? 'demo') as DemoTab)),
  );

  readonly link = videoLink;

  selectTab(index: number): void {
    const tab = this.tabs()[index] ?? 'demo';
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { tab: tab === 'demo' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
