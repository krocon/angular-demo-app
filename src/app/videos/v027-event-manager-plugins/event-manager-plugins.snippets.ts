import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'core/events/timing-event.plugins.ts',
    'supports() + addEventListener() returning a cleanup function.',
  ],
  ['app.config.ts', 'Registered via EVENT_MANAGER_PLUGINS (multi: true).'],
  [
    'event-manager-plugins.page.html',
    'Usage: (input.debounce.500)="…" – anywhere in any template.',
  ],
  'leak-probe.ts',
  'core/events/event-plugin-stats.store.ts',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'search.component.ts',
    `
export class SearchComponent implements AfterViewInit {
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    fromEvent(this.search.nativeElement, 'input')
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.onSearch(event));
  }
}
// … and the same boilerplate again in every component that needs it.
`,
    'ViewChild + fromEvent + debounceTime + cleanup – per component.',
  ),
  after: snippet(
    'search.component.html',
    `
<input (input.debounce.500)="onSearch($event)" />
`,
    'One plugin, registered once – declarative everywhere.',
  ),
};
