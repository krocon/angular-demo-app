import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'user-card.ts',
    'input(), input.required(), output(), model(), computed(), viewChild(), contentChildren().',
  ],
  ['signal-component-api.page.html', '[(rating)] – banana in a box with model().'],
  'signal-component-api.page.ts',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'user-card.decorators.ts',
    `
export class UserCardComponent implements OnChanges, AfterViewInit, AfterContentInit {
  @Input({ required: true }) name!: string;
  @Input({ transform: booleanAttribute }) highlighted = false;
  @Input() rating = 0;
  @Output() ratingChange = new EventEmitter<number>();
  @Output() selected = new EventEmitter<string>();
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  @ContentChildren(TagDirective) tags?: QueryList<TagDirective>;

  initials = '';
  tagCount = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      this.initials = this.name.split(' ').map((p) => p[0]).join('');
    }
  }
  ngAfterContentInit() {
    this.tagCount = this.tags?.length ?? 0;
    this.tags?.changes.subscribe(() => (this.tagCount = this.tags!.length));
  }
  ngAfterViewInit() {
    // nameInput is only available from here on …
  }
  setRating(star: number) {
    this.rating = star;
    this.ratingChange.emit(star);
  }
}
`,
    'Decorators, lifecycle hooks, QueryList subscriptions and manual xChange outputs.',
  ),
  after: snippet(
    'user-card.signals.ts',
    `
export class UserCard {
  readonly name = input.required<string>();
  readonly highlighted = input(false, { transform: booleanAttribute });
  readonly rating = model(0);
  readonly selected = output<string>();
  readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  readonly tags = contentChildren(TagDirective);

  readonly initials = computed(() =>
    this.name().split(' ').map((p) => p[0]).join(''),
  );
}
`,
    'Signals all the way: computed() replaces ngOnChanges, queries are always up to date.',
  ),
};
