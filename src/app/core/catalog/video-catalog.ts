import { VideoEntry } from './video.model';

/**
 * Single source of truth for all 27 videos. Routes, navigation, the home grid and
 * prev/next links are all derived from this list.
 */
export const VIDEO_CATALOG = [
  {
    num: '001',
    slug: 'signal-forms-intro',
    title: 'Signal Forms: Getting Started',
    category: 'Signal Forms',
    summary:
      'Put your data in a plain signal, wrap it with form() and bind it with [formField] – the form state follows automatically.',
    keyPoints: [
      'Model first: the data lives in a plain signal and form() wraps it.',
      'Bind with [formField] – two-way value plus field state.',
      'Validation lives in the schema (required, email, min) with custom messages.',
      'Everything is a signal: valid, touched and errors are read directly in the template.',
    ],
    takeaway: 'Signal first, the form follows!',
    apiStatus: 'stable',
    tags: ['form()', '[formField]', 'required', 'email', 'min'],
    loadComponent: () =>
      import('../../videos/v001-signal-forms-intro/signal-forms-intro.page').then(
        (m) => m.SignalFormsIntroPage,
      ),
  },
  {
    num: '002',
    slug: 'validation',
    title: 'Validation Patterns',
    category: 'Signal Forms',
    summary:
      'Built-in validators, conditional rules, cross-field checks, custom rules and debounced HTTP validation – all declared in the schema.',
    keyPoints: [
      'Built-in validators: required, email, min, max, minLength, pattern.',
      'Conditional rules with the `when` option.',
      'Cross-field checks with validate() and valueOf().',
      'Custom rule functions return { kind, message } or null.',
      'Async validateHttp() with built-in debounce and a pending state.',
    ],
    takeaway: 'Rules in the schema, subscriptions out!',
    apiStatus: 'stable',
    tags: ['validate', 'validateHttp', 'when', 'debounce', 'pending'],
    loadComponent: () =>
      import('../../videos/v002-validation/validation.page').then((m) => m.ValidationPage),
  },
  {
    num: '003',
    slug: 'dynamic-arrays',
    title: 'Dynamic Forms with Arrays',
    category: 'Signal Forms',
    summary:
      'Arrays live directly in the model signal – add, remove and reorder rows with immutable updates and validate each row with applyEach().',
    keyPoints: [
      'The array lives in the model – no FormArray.',
      'Immutable updates with update() + spread / filter.',
      'Render with @for over the array field and bind each row with [formField].',
      'applyEach() validates every row.',
    ],
    takeaway: 'An array in a signal instead of FormArray!',
    apiStatus: 'stable',
    tags: ['applyEach', 'arrays', '@for', 'drag & drop'],
    loadComponent: () =>
      import('../../videos/v003-dynamic-arrays/dynamic-arrays.page').then(
        (m) => m.DynamicArraysPage,
      ),
  },
  {
    num: '004',
    slug: 'custom-controls',
    title: 'Custom Controls with model()',
    category: 'Signal Forms',
    summary:
      'Implement FormValueControl<T> with a single model() and your component binds like a native input – disabled, touched and errors arrive automatically.',
    keyPoints: [
      'Implement FormValueControl<T> with value = model().',
      'Call value.set() on interaction.',
      'Bind like a native input with [formField].',
      'disabled, touched and errors are inputs filled by Signal Forms.',
    ],
    takeaway: 'value with model, bind with formField, done!',
    apiStatus: 'stable',
    tags: ['FormValueControl', 'model()', 'ControlValueAccessor', 'a11y'],
    loadComponent: () =>
      import('../../videos/v004-custom-controls/custom-controls.page').then(
        (m) => m.CustomControlsPage,
      ),
  },
  {
    num: '005',
    slug: 'testing-forms',
    title: 'Testing Signal Forms with Vitest',
    category: 'Signal Forms',
    summary:
      'Vitest is the default runner. Test Signal Forms synchronously: set the model, read the state – no fakeAsync, no tick.',
    keyPoints: [
      'Vitest is the default runner (unit-test builder, Vite pipeline).',
      'Runs in Node with jsdom/happy-dom – container-ready.',
      'Test forms synchronously via the model signal and valid/errors/dirty.',
      'Real interaction via Testing Library or Vitest Browser Mode with Playwright.',
    ],
    takeaway: 'Set the model, read the state – no fakeAsync, no tick.',
    apiStatus: 'stable',
    tags: ['Vitest', 'unit-test builder', 'jsdom', 'TestBed'],
    loadComponent: () =>
      import('../../videos/v005-testing-forms/testing-forms.page').then((m) => m.TestingFormsPage),
  },
  {
    num: '006',
    slug: 'auto-save',
    title: 'Auto-Save & Form State (Dirty/Reset)',
    category: 'Signal Forms',
    summary:
      'dirty, touched and valid are signals: auto-save with a debounced stream, guard the route while dirty and reset after a successful save.',
    keyPoints: [
      'dirty, touched and valid are signals.',
      'A canDeactivate guard checks dirty.',
      'Auto-save via toObservable(model) + debounceTime(500) → API.',
      'reset() after a successful save – pristine again.',
    ],
    takeaway: 'State as signals, save with debounce, then reset!',
    apiStatus: 'stable',
    tags: ['dirty', 'reset()', 'canDeactivate', 'toObservable', 'auto-save'],
    loadComponent: () =>
      import('../../videos/v006-auto-save/auto-save.page').then((m) => m.AutoSavePage),
    loadChildren: () =>
      import('../../videos/v006-auto-save/auto-save.routes').then((m) => m.routes),
  },
  {
    num: '007',
    slug: 'tips-and-tricks',
    title: 'Signal Forms: 5 Pro Tips',
    category: 'Signal Forms',
    summary:
      'Typed models, schema logic for disabled/readonly/hidden, debounce only where it matters, submit() and UI flags in computed().',
    keyPoints: [
      'Type your model with an interface.',
      'Logic in the schema: disabled, readonly and hidden with `when` (hidden skips validation).',
      'Debounce only the async validator.',
      'submit() marks everything as touched and only runs when valid.',
      'UI flags belong in computed(), not in the model.',
    ],
    takeaway: 'Five tips, cleaner forms.',
    apiStatus: 'stable',
    tags: ['hidden', 'readonly', 'disabled', 'submit()', 'computed'],
    loadComponent: () =>
      import('../../videos/v007-tips-and-tricks/tips-and-tricks.page').then(
        (m) => m.TipsAndTricksPage,
      ),
  },
  {
    num: '008',
    slug: 'migration-old-vs-new',
    title: 'Migration: Reactive vs. Signal Forms',
    category: 'Signal Forms',
    summary:
      'The same order form twice – Reactive Forms with FormBuilder and subscriptions next to Signal Forms with computed totals.',
    keyPoints: [
      'Before: FormBuilder, nested FormGroups, takeUntilDestroyed per stream.',
      'After: interface + signal + form() + [formField].',
      'Old and new coexist in one app.',
      'No manual subscriptions → no leaks.',
      'Zoneless-ready.',
    ],
    takeaway: 'Less boilerplate, zero leaks!',
    apiStatus: 'stable',
    tags: ['migration', 'Reactive Forms', 'FormBuilder', 'computed'],
    loadComponent: () =>
      import('../../videos/v008-migration-old-vs-new/migration-old-vs-new.page').then(
        (m) => m.MigrationOldVsNewPage,
      ),
  },
  {
    num: '009',
    slug: 'big-tables',
    title: 'Angular 22 & Big Tables',
    category: 'Data & UI',
    summary:
      'Rows × columns = DOM nodes. Compare a plain table, a paginated mat-table and CDK virtual scrolling with live DOM and FPS metrics.',
    keyPoints: [
      'Rows × columns = DOM nodes.',
      'Few rows: a plain table with @for + track is fine.',
      'Paging only hides the problem.',
      'CDK virtual scroll: fixed row height, sorting/filtering is on you.',
      'Grid frameworks virtualize in both directions (ag-Grid, GUI Expert Table).',
    ],
    takeaway: 'Only render what users see!',
    apiStatus: 'stable',
    tags: ['mat-table', 'paginator', 'virtual scroll', 'performance'],
    loadComponent: () =>
      import('../../videos/v009-big-tables/big-tables.page').then((m) => m.BigTablesPage),
  },
  {
    num: '010',
    slug: 'look-and-feel',
    title: 'Look & Feel with Material Theming',
    category: 'Data & UI',
    summary:
      'Design tokens as CSS custom properties: play with colors, corner radius, density and fonts in a scoped Material 3 preview.',
    keyPoints: [
      'Three paths: custom CSS, a UI library, Angular Material.',
      'Design tokens as CSS variables (e.g. --mat-sys-primary) instead of hacks.',
      'Plain CSS for simple overrides, SCSS for reusable themes and *-overrides mixins.',
      'Material has its own look – fully custom branding may need another path.',
    ],
    takeaway: 'Material, your own theme and CSS custom properties!',
    apiStatus: 'stable',
    tags: ['Material 3', 'design tokens', 'theming', 'overrides'],
    loadComponent: () =>
      import('../../videos/v010-look-and-feel/look-and-feel.page').then((m) => m.LookAndFeelPage),
  },
  {
    num: '011',
    slug: 'zoneless',
    title: 'Zoneless Angular (Bye bye zone.js)',
    category: 'Reactivity & Signals',
    summary:
      'Without zone.js, Angular re-renders on signal changes, template events and new inputs – setTimeout alone no longer triggers change detection.',
    keyPoints: [
      'One provider: provideZonelessChangeDetection(), zone.js out of the polyfills.',
      'Re-render on signal change, template events and new inputs.',
      'No monkey patching – setTimeout does not trigger change detection.',
      'Zoneless is the default since v21; new v22 projects are zoneless + OnPush by default.',
    ],
    takeaway: 'Signals instead of zones!',
    apiStatus: 'stable',
    tags: ['zoneless', 'change detection', 'OnPush', 'afterEveryRender'],
    loadComponent: () =>
      import('../../videos/v011-zoneless/zoneless.page').then((m) => m.ZonelessPage),
  },
  {
    num: '012',
    slug: 'resource',
    title: 'Data Fetching with resource() & rxResource()',
    category: 'Reactivity & Signals',
    summary:
      'Fetch data without subscribe: one UI, three implementations – resource, rxResource and httpResource – with automatic cancellation.',
    keyPoints: [
      'resource({ params, loader }) with an abortSignal.',
      'value, status, isLoading and error are signals.',
      'Auto re-fetch on param change – the old request is cancelled.',
      'rxResource for Observables, httpResource for simple GETs.',
      'Resources are for reading – writes go through HttpClient post/put/patch/delete.',
    ],
    takeaway: 'Fetch data without subscribe!',
    apiStatus: 'stable',
    tags: ['resource', 'rxResource', 'httpResource', 'AbortSignal'],
    loadComponent: () =>
      import('../../videos/v012-resource/resource.page').then((m) => m.ResourcePage),
  },
  {
    num: '013',
    slug: 'virtual-scrolling',
    title: 'High-Performance Virtual Scrolling',
    category: 'Data & UI',
    summary:
      '100,000 rows, about 30 in the DOM: CDK virtual scrolling with signal-based filtering, sorting and live buffer tuning.',
    keyPoints: [
      'Only visible rows + buffer live in the DOM; rows are recycled.',
      'Tune itemSize, minBufferPx and maxBufferPx.',
      'Signals as the data source, filter/sort via computed().',
      'Tracking keeps rows stable – ~30 rows in the DOM at 60 FPS.',
    ],
    takeaway: 'Only render what users see!',
    apiStatus: 'stable',
    tags: ['cdk-virtual-scroll-viewport', 'computed', 'FPS'],
    loadComponent: () =>
      import('../../videos/v013-virtual-scrolling/virtual-scrolling.page').then(
        (m) => m.VirtualScrollingPage,
      ),
  },
  {
    num: '014',
    slug: 'view-transitions',
    title: 'Native App Animations with View Transitions',
    category: 'Data & UI',
    summary:
      'One router feature gives you crossfades – shared view-transition-name values morph a product tile into its detail header.',
    keyPoints: [
      'withViewTransitions() on provideRouter → crossfade (developer preview).',
      'Element morphing with a shared view-transition-name.',
      'Duration/easing live in GLOBAL styles (view encapsulation!).',
      'Progressive enhancement (~92 % browser support).',
    ],
    takeaway: 'One switch, and your app feels native!',
    apiStatus: 'developer-preview',
    tags: ['withViewTransitions', 'view-transition-name', 'animation'],
    loadComponent: () =>
      import('../../videos/v014-view-transitions/view-transitions.page').then(
        (m) => m.ViewTransitionsPage,
      ),
    loadChildren: () =>
      import('../../videos/v014-view-transitions/view-transitions.routes').then((m) => m.routes),
  },
  {
    num: '015',
    slug: 'let-syntax',
    title: 'Clean Templates with @let',
    category: 'Templates & Performance',
    summary:
      'Name a value once and read it everywhere in the template – read-only, block-scoped and always up to date.',
    keyPoints: [
      "@let fullName = first + ' ' + last;",
      'Compute once, use many times.',
      'Works with the async pipe (replaces *ngIf … as).',
      'Read-only, block-scoped, updates automatically.',
      'For conditional rendering still use @if.',
    ],
    takeaway: 'Name it once, read it everywhere!',
    apiStatus: 'stable',
    tags: ['@let', 'templates', 'async pipe'],
    loadComponent: () =>
      import('../../videos/v015-let-syntax/let-syntax.page').then((m) => m.LetSyntaxPage),
  },
  {
    num: '016',
    slug: 'defer',
    title: 'Performance Boost with @defer',
    category: 'Templates & Performance',
    summary:
      'Wrap heavy parts in @defer and they move into separate chunks – loaded on viewport, interaction, hover, idle or a condition.',
    keyPoints: [
      'Wrap in @defer → separate chunk.',
      'Triggers: on viewport, on interaction, default on idle.',
      '@placeholder, @loading and @error blocks.',
      'prefetch on idle.',
      'The component must be standalone and not referenced outside the block in the same file.',
    ],
    takeaway: "Only load what's needed!",
    apiStatus: 'stable',
    tags: ['@defer', 'lazy loading', 'chunks', 'prefetch'],
    loadComponent: () => import('../../videos/v016-defer/defer.page').then((m) => m.DeferPage),
  },
  {
    num: '017',
    slug: 'signal-component-api',
    title: 'Signal Component API',
    category: 'Reactivity & Signals',
    summary:
      'input(), output(), model() and signal queries – a parent/child playground where every binding is a signal.',
    keyPoints: [
      'input() / input.required() are checked by the compiler.',
      'output() replaces EventEmitter – emit() is unchanged.',
      'viewChild / contentChildren as signals – no timing issues.',
      'computed() instead of ngOnChanges, effect() for side effects.',
      'Bonus: model() for two-way binding [( )].',
    ],
    takeaway: 'Inputs, outputs, queries – all signals!',
    apiStatus: 'stable',
    tags: ['input()', 'output()', 'model()', 'viewChild', 'contentChildren'],
    loadComponent: () =>
      import('../../videos/v017-signal-component-api/signal-component-api.page').then(
        (m) => m.SignalComponentApiPage,
      ),
  },
  {
    num: '018',
    slug: 'signal-state',
    title: 'Lightweight State Management with Signals',
    category: 'Reactivity & Signals',
    summary:
      'A private signal, a few computed selectors and methods – that is your store. Global or feature-scoped, side by side.',
    keyPoints: [
      'State is a private signal in a service.',
      'Read-only outside via asReadonly() / computed selectors.',
      'Updates as methods (addTodo, reset).',
      "Global (providedIn: 'root' / @Service) vs. feature (component providers).",
    ],
    takeaway: "One signal, a few methods, and that's your store!",
    apiStatus: 'stable',
    tags: ['store', 'signal', 'computed', 'providers'],
    loadComponent: () =>
      import('../../videos/v018-signal-state/signal-state.page').then((m) => m.SignalStatePage),
  },
  {
    num: '019',
    slug: 'signal-patterns',
    title: 'Signal & Resource Patterns Cheat Sheet',
    category: 'Reactivity & Signals',
    summary:
      'computed, linkedSignal, equal, effect, streaming resources, debounced vs. throttleTime – and a decision helper for the right pattern.',
    keyPoints: [
      'Derive: computed(), linkedSignal() (settable), the equal option.',
      'effect() only for side effects (localStorage, logging, external APIs).',
      'Async reads: resource / httpResource / rxResource, abortSignal, chain, the stream option.',
      'Delay: debounced() (new, experimental) – throttling via RxJS throttleTime.',
      'Resources are reads, not a cache; SSR: id + TransferState.',
    ],
    takeaway: 'The right pattern for every job!',
    apiStatus: 'experimental',
    tags: ['computed', 'linkedSignal', 'effect', 'debounced', 'stream'],
    loadComponent: () =>
      import('../../videos/v019-signal-patterns/signal-patterns.page').then(
        (m) => m.SignalPatternsPage,
      ),
  },
  {
    num: '020',
    slug: 'http-interceptors',
    title: 'HTTP Interceptors, HttpContext & Error Handling',
    category: 'Architecture & HTTP',
    summary:
      'Functional interceptors for auth, errors, loading and logging, per-request HttpContext flags and a route-level HttpClient.',
    keyPoints: [
      'Functional interceptors via provideHttpClient(withInterceptors([...])).',
      'Auth and error handling in one place (401/500).',
      'HttpContextToken flags per request (skip token, skip spinner).',
      'Route-level HttpClient with its own interceptors + withRequestsMadeViaParent().',
    ],
    takeaway: 'Cross-cutting logic belongs in the interceptor!',
    apiStatus: 'stable',
    tags: ['interceptors', 'HttpContext', 'withRequestsMadeViaParent', '401', '500'],
    loadComponent: () =>
      import('../../videos/v020-http-interceptors/http-interceptors.page').then(
        (m) => m.HttpInterceptorsPage,
      ),
    loadChildren: () =>
      import('../../videos/v020-http-interceptors/http-interceptors.routes').then((m) => m.routes),
  },
  {
    num: '021',
    slug: 'vitest-bindings',
    title: 'Component Tests with Vitest & the Bindings API',
    category: 'Testing & Tooling',
    summary:
      'inputBinding, outputBinding and twoWayBinding connect signals and spies directly in TestBed.createComponent – no host component needed.',
    keyPoints: [
      'Vitest is the default runner.',
      'inputBinding connects an input to a signal in TestBed.createComponent.',
      'outputBinding → a function or a vi.fn() spy.',
      'Signals & resources: set the signal, await fixture.whenStable(), HttpTestingController.',
    ],
    takeaway: 'Bind inputs as signals, catch outputs, done!',
    apiStatus: 'stable',
    tags: ['inputBinding', 'outputBinding', 'twoWayBinding', 'Vitest'],
    loadComponent: () =>
      import('../../videos/v021-vitest-bindings/vitest-bindings.page').then(
        (m) => m.VitestBindingsPage,
      ),
  },
  {
    num: '022',
    slug: 'dependency-injection',
    title: 'Dependency Injection & Service Lifecycle',
    category: 'Architecture & HTTP',
    summary:
      'inject() everywhere, app and environment initializers, route-scoped services and withAutoCleanupInjectors() destroying them when the route is left.',
    keyPoints: [
      'inject() everywhere – also in guards and interceptors.',
      'provideAppInitializer (startup config) / provideEnvironmentInitializer (per injector).',
      'Route providers scope services to a feature; since 22.2 withAutoCleanupInjectors() destroys them when the route is inactive.',
      'DestroyRef for cleaning up connections and timers.',
    ],
    takeaway: 'Decide where state lives, then provide it!',
    apiStatus: 'stable',
    tags: ['inject()', 'provideAppInitializer', 'route providers', 'DestroyRef'],
    loadComponent: () =>
      import('../../videos/v022-dependency-injection/dependency-injection.page').then(
        (m) => m.DependencyInjectionPage,
      ),
    loadChildren: () =>
      import('../../videos/v022-dependency-injection/dependency-injection.routes').then(
        (m) => m.routes,
      ),
  },
  {
    num: '023',
    slug: 'bundle-optimization',
    title: 'Bundle Analysis & Optimization',
    category: 'Templates & Performance',
    summary:
      'Measure first with stats.json and source maps, enforce budgets, replace heavy libraries with Intl and load the rest on demand.',
    keyPoints: [
      'Measure with ng build --stats-json + the esbuild analyzer or source-map-explorer.',
      'Budgets in angular.json.',
      'Tree-shaking: precise imports, no side-effect imports, ESM instead of CommonJS.',
      'Replace heavy libraries with native APIs like Intl.',
      'Load the rest on demand with @defer / import().',
    ],
    takeaway: 'Measure first, then optimize!',
    apiStatus: 'stable',
    tags: ['bundle', 'budgets', 'Intl', 'tree-shaking', 'import()'],
    loadComponent: () =>
      import('../../videos/v023-bundle-optimization/bundle-optimization.page').then(
        (m) => m.BundleOptimizationPage,
      ),
  },
  {
    num: '024',
    slug: 'migrate-legacy-app',
    title: 'Migrating a Legacy App to Angular 22',
    category: 'Testing & Tooling',
    summary:
      'ng update one major at a time, then the standalone, control-flow, inject and signal migrations – build, test and commit after every step.',
    keyPoints: [
      'ng update one major at a time – follow angular.dev/update-guide.',
      'Standalone migration.',
      'Control flow and inject() migrations.',
      'Signal input/output/query migrations.',
      'After every step: build, test, commit.',
    ],
    takeaway: 'Small steps instead of a big bang!',
    apiStatus: 'stable',
    tags: ['ng update', 'schematics', 'migration'],
    loadComponent: () =>
      import('../../videos/v024-migrate-legacy-app/migrate-legacy-app.page').then(
        (m) => m.MigrateLegacyAppPage,
      ),
  },
  {
    num: '025',
    slug: 'review-ai-code',
    title: 'Reviewing AI-Generated Angular Code',
    category: 'Testing & Tooling',
    summary:
      'AI often writes outdated Angular. A rule-based checker spots NgModules, *ngIf, decorators, leaky subscriptions and missing track.',
    keyPoints: [
      'AI often produces outdated code (NgModules, *ngIf, @Input, subscribe without cleanup).',
      'Spot outdated APIs: constructor injection, BehaviorSubject instead of signals, missing track.',
      'Verify unknown APIs on angular.dev (hallucinations).',
      'Give it rules: the official best-practices.md.',
      'Use the Angular CLI MCP server.',
    ],
    takeaway: 'AI writes, you review!',
    apiStatus: 'stable',
    tags: ['AI', 'code review', 'best practices', 'MCP'],
    loadComponent: () =>
      import('../../videos/v025-review-ai-code/review-ai-code.page').then(
        (m) => m.ReviewAiCodePage,
      ),
  },
  {
    num: '026',
    slug: 'resource-composition',
    title: 'Resource Composition (chain & Snapshots)',
    category: 'Reactivity & Signals',
    summary:
      'chain() reads a previous resource inside params, status propagates automatically, and snapshots keep old data visible while reloading.',
    keyPoints: [
      'chain in the params context reads the previous resource (e.g. companyId).',
      'Status propagation: the second waits while the first loads and inherits errors.',
      'Snapshots: status + value; resourceFromSnapshots() builds a new resource.',
      'linkedSignal on the snapshot keeps old data while reloading – no flicker.',
    ],
    takeaway: 'Chain resources instead of nesting streams!',
    apiStatus: 'experimental',
    tags: ['chain', 'snapshot', 'resourceFromSnapshots', 'linkedSignal'],
    loadComponent: () =>
      import('../../videos/v026-resource-composition/resource-composition.page').then(
        (m) => m.ResourceCompositionPage,
      ),
  },
  {
    num: '027',
    slug: 'event-manager-plugins',
    title: 'Event Manager Plugins',
    category: 'Architecture & HTTP',
    summary:
      'Write a plugin once and use (input.debounce.500) anywhere – supports() plus addEventListener() returning a cleanup function.',
    keyPoints: [
      'The built-in plugin already powers keyup.enter and keydown.shift.tab.',
      'Your own plugin extends EventManagerPlugin: supports() + addEventListener() returning a cleanup function.',
      'Register via EVENT_MANAGER_PLUGINS (multi).',
      'Use anywhere: (input.debounce.500)="…" – always return a cleanup.',
    ],
    takeaway: 'Write once, use everywhere!',
    apiStatus: 'stable',
    tags: ['EventManagerPlugin', 'EVENT_MANAGER_PLUGINS', 'debounce', 'throttle'],
    loadComponent: () =>
      import('../../videos/v027-event-manager-plugins/event-manager-plugins.page').then(
        (m) => m.EventManagerPluginsPage,
      ),
  },
] as const satisfies readonly VideoEntry[];

export function findVideo(num: string): VideoEntry | undefined {
  return VIDEO_CATALOG.find((v) => v.num === num);
}

export function videoIndex(num: string): number {
  return VIDEO_CATALOG.findIndex((v) => v.num === num);
}
