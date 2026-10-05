import {
  Component,
  ElementRef,
  EnvironmentInjector,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { VIDEO_CATALOG } from './core/catalog/video-catalog';
import { VIDEO_CATEGORIES, VideoEntry, videoLink } from './core/catalog/video.model';
import { NetworkSettingsStore } from './core/fake-backend/network-settings.store';
import { LoadingStore } from './core/http/loading.store';
import { LayoutStore } from './core/layout/layout.store';
import { SearchStore } from './core/search/search.store';
import { ThemeMode, ThemeStore } from './core/theme/theme.store';

const VIDEO_URL = /^\/videos\/(\d{3})-/;

/** App shell: toolbar (search, theme, network), progress bar, sidenav and router outlet. */
@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class App {
  readonly #router = inject(Router);
  readonly #injector = inject(EnvironmentInjector);
  readonly theme = inject(ThemeStore);
  readonly layout = inject(LayoutStore);
  readonly loading = inject(LoadingStore);
  readonly search = inject(SearchStore);
  readonly network = inject(NetworkSettingsStore);

  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly link = videoLink;
  readonly themeIcons: Record<ThemeMode, string> = {
    light: 'light_mode',
    dark: 'dark_mode',
    system: 'brightness_auto',
  };

  readonly groups = computed(() =>
    VIDEO_CATEGORIES.map((category) => ({
      category,
      videos: this.search.results().filter((v) => v.category === category),
    })).filter((group) => group.videos.length > 0),
  );

  readonly #url = toSignal(
    this.#router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.#router.url },
  );

  readonly currentIndex = computed(() => {
    const num = VIDEO_URL.exec(this.#url())?.[1];
    return num ? VIDEO_CATALOG.findIndex((v) => v.num === num) : -1;
  });

  /** The panel (slider, toggle, bottom sheet) is loaded on demand to keep the shell small. */
  async openNetworkPanel(): Promise<void> {
    const [{ MatBottomSheet }, { NetworkPanel }] = await Promise.all([
      import('@angular/material/bottom-sheet'),
      import('./core/fake-backend/network-panel'),
    ]);
    this.#injector.get(MatBottomSheet).open(NetworkPanel, { ariaLabel: 'Network settings' });
  }

  onSearchEnter(): void {
    const first = this.search.results()[0];
    if (first) {
      void this.#router.navigateByUrl(videoLink(first));
    }
  }

  navigateRelative(delta: number): boolean {
    const target: VideoEntry | undefined = VIDEO_CATALOG[this.currentIndex() + delta];
    if (this.currentIndex() < 0 || !target) {
      return false;
    }
    void this.#router.navigateByUrl(videoLink(target));
    return true;
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing =
      !!target &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (event.key === '/' && !typing) {
      event.preventDefault();
      this.searchInput().nativeElement.focus();
    } else if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      if (this.navigateRelative(event.key === 'ArrowLeft' ? -1 : 1)) {
        event.preventDefault();
      }
    }
  }
}
