# Prompt 07: Angular-22-Demo-App zur Videoreihe (eine Route pro Video)

## Zweck
Führe diesen Prompt mit einem Coding-Agenten (z. B. Claude Code) aus, um eine moderne Angular-22-Demo-Anwendung zu erzeugen, die zu **jedem der 27 Videos** eine eigene Seite (Route) mit einer **lauffähigen, interaktiven Live-Demo** enthält. Die Inhalte stammen aus den Skripten `videos/**/scripts_text/script_en.txt`.

- UI-Sprache: **Englisch**
- Design: **Angular Material 3** (Design Tokens, Light/Dark)
- Reaktivität: **Signals** überall (zoneless, OnPush)
- Tests: **Vitest** (Angular `unit-test`-Builder)
- Anspruch: modern, state-of-the-art, keine Legacy-APIs

---

## Auszuführender Prompt

```text
Du bist mein Senior Angular Architect und erzeugst ein vollständiges, lauffähiges
Demo-Projekt zur YouTube-Videoreihe „Angular 22“. Für JEDES der 27 Videos gibt es
eine eigene, lazy geladene Route mit einer interaktiven Live-Demo, die genau die
Inhalte des jeweiligen Videos zum Anfassen zeigt. Arbeite gründlich, Schritt für
Schritt, und liefere am Ende ein Projekt, das ohne Nacharbeit baut, testet und läuft.

══════════════════════════════════════════════════════════════════════════════
0. ARBEITSWEISE & GROUND RULES
══════════════════════════════════════════════════════════════════════════════

0.1 Quellen der Wahrheit
- Falls im Workspace vorhanden: Lies alle Dateien `videos/**/scripts_text/script_en.txt`
  und `videos/**/video.json` (dort stehen Code-Snippets aus den Videos). Sie sind die
  inhaltliche Grundlage jeder Demo. Die Zusammenfassungen in Abschnitt 6 dieses
  Prompts sind verbindlich, falls die Dateien fehlen.
- Die API-Wahrheit ist die INSTALLIERTE Angular-Version (Typings in node_modules)
  und angular.dev – NICHT dein Trainingswissen. Angular 22 hat neue/umbenannte APIs
  (Signal Forms stabil, `[formField]`, `validateHttp` mit `debounce`, Resource
  `chain`/Snapshots, `debounced`, `withAutoCleanupInjectors` ab 22.2 …).
- Nutze den Angular CLI MCP-Server (`ng mcp`), falls verfügbar: Tools wie
  `get_best_practices`, `search_documentation`, `find_examples`, `list_projects`.
- Prüfe JEDE API, die du verwendest, gegen die `.d.ts`-Dateien in
  `node_modules/@angular/*`. Wenn eine im Video genannte API in der installierten
  Version anders heißt, experimentell ist oder fehlt:
  → nimm die korrekte aktuelle API,
  → markiere es in der UI mit einem Chip „Experimental“ bzw. „Developer Preview“,
  → dokumentiere die Abweichung in `docs/API-NOTES.md` (Video, erwartete API,
    tatsächliche API, Begründung).
  Erfinde niemals APIs. Keine `// @ts-ignore`, kein `any` als Ausweg.

0.2 Vorgehen in Phasen (nach jeder Phase: build + test + lint grün)
- Phase A: Projekt-Setup, Tooling, Theme, App-Shell, Video-Katalog, Fake-Backend,
  gemeinsame Bausteine (DemoPage-Layout, Code-Viewer, Before/After-Vergleich).
- Phase B: Videos 001–008 (Signal Forms).
- Phase C: Videos 009–019.
- Phase D: Videos 020–027.
- Phase E: Tests vervollständigen, Accessibility- und Performance-Check, README,
  docs/API-NOTES.md, Abschluss-Review gegen die Definition of Done (Abschnitt 9).
- Zeige mir nach Phase A eine kurze Zusammenfassung (Struktur + Screens), dann
  arbeite die restlichen Phasen ohne weitere Rückfragen ab. Frage nur bei echten
  Blockern.

0.3 Code-Qualität (gilt überall)
- Nur Standalone-Komponenten, keine NgModules.
- Zoneless (kein zone.js im Bundle), ChangeDetection OnPush (in Angular 22 Default –
  nicht durch explizites `Default` aushebeln).
- State ausschließlich als Signals: `signal`, `computed`, `linkedSignal`, `effect`
  nur für echte Seiteneffekte, `resource`/`httpResource`/`rxResource` für Lesen.
- Komponenten-API: `input()`, `input.required()`, `output()`, `model()`,
  `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`.
  Keine Decorators `@Input/@Output/@ViewChild/@HostBinding/@HostListener`
  (stattdessen `host: {}` im Component-Decorator).
- DI ausschließlich mit `inject()`, keine Constructor-Injection.
- Template-Syntax: `@if`, `@for` (immer mit `track`), `@switch`, `@let`, `@defer`.
  Kein `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` (nutze `[class.x]`, `[style.x]`).
- RxJS nur dort, wo es fachlich sinnvoll ist (debounceTime, throttleTime, Interop
  via `toSignal`/`toObservable`, `rxResource`). Kein manuelles `subscribe` ohne
  `takeUntilDestroyed`/DestroyRef – Ausnahme: Demo „Before“-Code, der bewusst
  das alte Muster zeigt (nur als Text im Code-Viewer oder klar markiert).
- TypeScript `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
  Angular `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`.
- Dateinamen und Selektoren nach aktuellem Angular Style Guide (ab v20 ohne
  `.component`-Suffix ist ok; entscheide dich für EINE Konvention und bleib dabei).
- Prefix für Selektoren: `app-`.
- Keine `::ng-deep`, kein `!important`. Styling über Material-Tokens (`--mat-sys-*`)
  und `mat.*-overrides`-Mixins.
- Barrierefreiheit: WCAG 2.2 AA, sinnvolle `aria-label`s, Fokus-Management,
  Tastaturbedienung, `LiveAnnouncer` für asynchrone Statusmeldungen,
  `prefers-reduced-motion` respektieren.

══════════════════════════════════════════════════════════════════════════════
1. TECH-STACK & SETUP
══════════════════════════════════════════════════════════════════════════════

1.1 Projekt anlegen (neueste Angular-22.x-Version)
- `npx @angular/cli@22 new angular22-video-demos --style=scss --routing
   --ssr=false --zoneless --test-runner=vitest --ai-config=claude`
  (Flags gegen `ng new --help` der installierten CLI prüfen; nicht unterstützte
  Flags weglassen – Zoneless und Vitest sind in v22 Standard.)
- `ng add @angular/material` (Material 3, eigenes Theme, Typografie, Animationen
  NICHT über das Legacy-Animations-Paket, sondern native CSS-Animationen bzw.
  `animate.enter`/`animate.leave`, falls verfügbar).
- `@angular/cdk` (Scrolling, A11y, Layout, Clipboard, DragDrop).
- `ng add angular-eslint`; Prettier mit `prettier-plugin-organize-imports`
  (oder gleichwertig). Skripte: `lint`, `format`, `format:check`.
- Keine weiteren UI-Bibliotheken. Zusätzliche Abhängigkeiten nur, wenn ein Video
  sie zwingend braucht (siehe 009 – optional) und begründet in README.

1.2 Testing
- Vitest über `@angular/build:unit-test` (`ng test`, `ng test --no-watch`,
  `ng test --coverage`). Umgebung: `jsdom` (oder `happy-dom`) – kein Karma,
  kein Chrome nötig.
- Optional zusätzlich: Vitest Browser Mode mit Playwright als eigenes npm-Script
  `test:browser` (nur einrichten, wenn ohne Mehraufwand lauffähig).
- `@testing-library/angular` + `@testing-library/user-event` für
  interaktionsnahe Tests (nur falls kompatibel mit der installierten Version;
  sonst reines TestBed).
- Coverage-Ziel: ≥ 80 % Statements für `src/app/core` und `src/app/shared`,
  jede Video-Seite mindestens ein Smoke-Test + Tests der Kernlogik.

1.3 Build & Budgets (angular.json)
- Budgets: initial ≤ 500 kB warn / 800 kB error (transfer-unabhängig, raw),
  anyComponentStyle ≤ 6 kB warn / 10 kB error. Passe Werte nur an, wenn nötig,
  und begründe es in README.
- npm-Skripte:
  - `start` → `ng serve`
  - `build` → `ng build`
  - `test` → `ng test --no-watch`
  - `test:watch` → `ng test`
  - `test:coverage` → `ng test --no-watch --coverage`
  - `lint` → `ng lint`
  - `analyze` → `ng build --stats-json` + Hinweis auf esbuild Bundle Analyzer
    (https://esbuild.github.io/analyze/) in der Konsole
  - `analyze:sme` → source-map-explorer (als devDependency) auf den Build mit
    Source Maps
  - `ci` → lint + test + build

1.4 Bootstrap (`app.config.ts`)
- `provideBrowserGlobalErrorListeners()`
- Zoneless: `provideZonelessChangeDetection()` (falls in v22 nicht schon implizit,
  dann explizit setzen, damit Video 011 es zeigen kann)
- `provideRouter(routes, withComponentInputBinding(), withViewTransitions({…}),
   withInMemoryScrolling({ scrollPositionRestoration: 'enabled',
   anchorScrolling: 'enabled' }), withRouterConfig({ paramsInheritanceStrategy: 'always' }))`
- `provideHttpClient(withFetch(), withInterceptors([...]))` – Reihenfolge der
  Interceptors siehe Abschnitt 4.
- `provideAppInitializer(...)` lädt `/api/config` (für Video 022).
- `TitleStrategy`: eigene Strategy → `"<Title> · Angular 22 Demos"`.
- `EVENT_MANAGER_PLUGINS`-Provider für das Debounce-Plugin (Video 027).

══════════════════════════════════════════════════════════════════════════════
2. ARCHITEKTUR & ORDNERSTRUKTUR
══════════════════════════════════════════════════════════════════════════════

src/
├─ app/
│  ├─ app.ts / app.html / app.scss          ← Shell (Toolbar, Sidenav, Outlet)
│  ├─ app.config.ts
│  ├─ app.routes.ts                          ← generiert Routen aus dem Katalog
│  ├─ core/
│  │  ├─ catalog/video-catalog.ts            ← SINGLE SOURCE OF TRUTH (27 Einträge)
│  │  ├─ catalog/video.model.ts
│  │  ├─ fake-backend/                       ← In-Memory-API via Interceptor
│  │  │  ├─ fake-backend.interceptor.ts
│  │  │  ├─ fake-db.ts                       ← deterministische Seed-Daten
│  │  │  └─ network-settings.store.ts        ← Latenz/Fehlerquote als Signals
│  │  ├─ http/                               ← auth, error, loading, logging Interceptors
│  │  ├─ layout/                             ← Breakpoints → toSignal
│  │  ├─ theme/theme.store.ts                ← light/dark/system als Signal
│  │  └─ title.strategy.ts
│  ├─ shared/
│  │  ├─ demo-page/                          ← einheitliches Seitenlayout
│  │  ├─ code-viewer/                        ← Snippet-Anzeige mit Copy-Button
│  │  ├─ before-after/                       ← Vergleich „Old way“ vs. „New way“
│  │  ├─ state-inspector/                    ← zeigt Signals/Form-State live (JSON)
│  │  ├─ metric-tile/                        ← kleine KPI-Kacheln (DOM-Nodes, FPS …)
│  │  ├─ event-log/                          ← zeitgestempelte Log-Liste (Signal)
│  │  └─ api-status-chip/                    ← Stable / Developer Preview / Experimental
│  ├─ pages/
│  │  ├─ home/                               ← Übersicht aller Videos
│  │  └─ not-found/
│  └─ videos/
│     ├─ v001-signal-forms-intro/
│     │  ├─ signal-forms-intro.page.ts|html|scss
│     │  ├─ signal-forms-intro.snippets.ts   ← Code-Snippets für den Code-Tab
│     │  └─ signal-forms-intro.page.spec.ts
│     ├─ v002-validation/
│     └─ … bis v027-event-manager-plugins/
├─ styles.scss                               ← Material-Theme + globale Tokens
└─ styles/view-transitions.scss              ← globale ::view-transition-* Regeln

2.1 Video-Katalog (`video-catalog.ts`)
- Typ:
  interface VideoEntry {
    num: string;               // '001'
    slug: string;              // 'signal-forms-intro'
    title: string;             // englischer Titel (siehe Abschnitt 6)
    category: VideoCategory;   // siehe 2.2
    summary: string;           // 1–2 Sätze, Englisch
    keyPoints: readonly string[];  // 3–5 Punkte aus dem Skript, Englisch
    takeaway: string;          // der „Remember: …“-Satz aus dem Skript
    apiStatus: 'stable' | 'developer-preview' | 'experimental';
    tags: readonly string[];
    loadComponent: () => Promise<Type<unknown>>;
  }
- `as const satisfies readonly VideoEntry[]`.
- Routen werden aus dem Katalog erzeugt: `/videos/:num-:slug` als statische Pfade
  (z. B. `/videos/001-signal-forms-intro`), jeweils `loadComponent`, `title`,
  `data: { video }`. Zusätzlich Redirect `/videos/001` → volle URL.
- Prev/Next-Navigation und Sidenav werden ebenfalls aus dem Katalog berechnet
  (`computed`).

2.2 Kategorien
- 'Signal Forms'            → 001–008
- 'Data & UI'               → 009, 010, 013, 014
- 'Reactivity & Signals'    → 011, 012, 017, 018, 019, 026
- 'Templates & Performance' → 015, 016, 023
- 'Architecture & HTTP'     → 020, 022, 027
- 'Testing & Tooling'       → 021, 024, 025

══════════════════════════════════════════════════════════════════════════════
3. UI / UX
══════════════════════════════════════════════════════════════════════════════

3.1 App-Shell
- `mat-toolbar` oben: Logo-Text „Angular 22 Demos“, globale Suche (Signal-basiert,
  filtert Videos nach Titel/Tags), Theme-Toggle (light / dark / system),
  Link „Network“ öffnet ein Panel (MatBottomSheet oder MatMenu) mit
  Fake-Backend-Einstellungen: Latenz (0–3000 ms, Slider), Fehlerquote (0–100 %),
  „Offline“-Toggle. Globaler `mat-progress-bar` (indeterminate) unter der Toolbar,
  gesteuert vom Loading-Interceptor.
- `mat-sidenav-container`: links Navigation, gruppiert nach Kategorie
  (`mat-nav-list` mit Sub-Headern), aktive Route hervorgehoben
  (`routerLinkActive`), Nummer + Titel + API-Status-Punkt.
  Responsiv: ab < 960 px `mode="over"`, sonst `side` (BreakpointObserver → toSignal).
- Tastatur: `/` fokussiert die Suche, `Alt+←/→` springt zum vorherigen/nächsten Video.

3.2 Startseite (`/`)
- Hero mit kurzer Beschreibung der Reihe.
- Filter-Chips (Kategorie, `mat-chip-listbox`) + Suchfeld.
- Grid aus `mat-card`s (responsive CSS Grid): Nummer, Titel, Summary,
  Kategorie-Chip, API-Status-Chip, Button „Open demo“.
- Ergebnisanzahl live, leerer Zustand mit Hinweis.

3.3 Einheitliches Demo-Seitenlayout (`<app-demo-page>`)
Jede Video-Seite nutzt dieselbe Hülle (Content Projection mit benannten Slots):
1. Header: „Video 012“, Titel (h1), Kategorie-Chip, API-Status-Chip, Summary.
2. „In this video“: Key Points als nummerierte Liste (aus dem Katalog).
3. `mat-tab-group` (Tab-Index per Query-Param `?tab=` synchronisiert):
   - „Live demo“  → die interaktive Demo (Hauptinhalt)
   - „Code“       → relevante Snippets mit Dateiname-Badge + Copy-Button
                    (CDK Clipboard + Snackbar „Copied“)
   - „Before / After“ → nur wo im Video ein Alt/Neu-Vergleich vorkommt
4. Takeaway-Banner („Remember: …“) mit Material-Tokens gestylt.
5. Footer: Prev / Next Video (Buttons mit Titeln).

3.4 Design
- Material 3 Theme in `styles.scss` mit `mat.theme((color: (primary: mat.$azure-palette,
  tertiary: mat.$violet-palette, theme-type: color-scheme), typography: Roboto/Inter,
  density: 0))` – Werte gegen die installierte Material-Version prüfen.
- Light/Dark über `color-scheme` auf `:root`/`html`, gesteuert vom ThemeStore
  (Signal + `effect` → `document.documentElement.style.colorScheme`; Persistenz in
  localStorage, try/catch).
- Ausschließlich System-Tokens (`var(--mat-sys-primary)`, `--mat-sys-surface-container`,
  `--mat-sys-corner-large`, `--mat-sys-body-medium` …) für eigene Styles.
- Code-Viewer: Monospace (`JetBrains Mono` oder System-Monospace),
  dezentes Syntax-Highlighting OHNE Fremdbibliothek (einfacher Tokenizer für
  Keywords/Strings/Kommentare reicht) – oder gar kein Highlighting, aber sauber.
- Mobile-first, keine horizontale Scrollbar auf 360 px Breite (außer in
  Code-Blöcken, die selbst scrollen).

══════════════════════════════════════════════════════════════════════════════
4. FAKE-BACKEND (keine echte API nötig)
══════════════════════════════════════════════════════════════════════════════

- Ein funktionaler `fakeBackendInterceptor`, der alle Requests auf `/api/**`
  beantwortet. Er wird als LETZTER Interceptor der Root-Kette registriert, damit
  Auth/Error/Loading/Logging-Interceptors davor laufen.
- Simulierte Latenz und Fehler aus dem `NetworkSettingsStore` (Signals).
  Respektiert Abbruch: Wenn der Request abgebrochen wird (Unsubscribe bzw.
  AbortSignal), Timer löschen und im Request-Log als „cancelled“ markieren.
- Request-Log (`RequestLogStore`, Signal-Array, max. 200 Einträge): Methode, URL,
  Header (inkl. Authorization), Status, Dauer, cancelled ja/nein. Wird von
  mehreren Demos angezeigt (012, 020, 026).
- Endpunkte (deterministische Seed-Daten, z. B. mit festem Seed-PRNG):
  GET  /api/config
  GET  /api/users?q=&page=&pageSize=        → paginiert, Suche
  GET  /api/users/:id
  GET  /api/companies/:id
  POST /api/users                           → legt an, 201
  GET  /api/usernames/:name/available       → { available: boolean }
                                              (belegt: admin, root, angular, nerd, …)
  PUT  /api/profile                         → Auto-Save-Ziel, echo + savedAt
  GET  /api/products, /api/products/:id     → für View Transitions (mit Farben/Emoji
                                              statt echter Bilder, keine externen Assets)
  GET  /api/status/401, /api/status/500     → Fehler-Demos
  GET  /api/ticker (stream-Simulation)      → für Resource `stream` (Video 019)

══════════════════════════════════════════════════════════════════════════════
5. GEMEINSAME BAUSTEINE
══════════════════════════════════════════════════════════════════════════════

- `StateInspector`: `input.required<unknown>()`, zeigt Wert als formatiertes JSON
  in einem `mat-card`, optional Flags (valid/dirty/touched/pending) als Chips.
- `MetricTile`: Label, Wert, Einheit, optional Trend; für DOM-Knoten, FPS,
  Render-Zeit, Anzahl Requests.
- `EventLog`: Signal-basierte Liste mit Zeitstempel, „Clear“-Button,
  `aria-live="polite"`.
- `BeforeAfter`: zwei Code-Viewer nebeneinander (auf Mobile untereinander),
  Zeilenzähler je Seite, Differenz als Chip („−18 lines“).
- `ApiStatusChip`: stable (grün), developer preview (amber), experimental (rot),
  Tooltip mit Erklärung.
- Utility `domNodeCount(element)` und ein `FpsMeter` (rAF-basiert, Signal-Ausgabe,
  stoppt via DestroyRef).

══════════════════════════════════════════════════════════════════════════════
6. DIE 27 SEITEN – INHALT & LIVE-DEMO JE VIDEO
══════════════════════════════════════════════════════════════════════════════

Für jede Seite gilt: Live-Demo zuerst, Code-Tab mit den Kern-Snippets
(identisch zum tatsächlich laufenden Code), „Before/After“ wo angegeben,
Takeaway-Banner mit dem „Remember“-Satz. Route = `/videos/<num>-<slug>`.

────────────────────────────────────────────────────────────────
001 · signal-forms-intro · „Signal Forms: Getting Started“
Takeaway: „Signal first, the form follows!“
Key points: Model first (data in a plain signal, `form()` wraps it) · Bind with
`[formField]` (two-way value + state) · Validation in the schema (required, email,
min with custom messages) · Everything is a signal (valid, touched, errors in template).
Demo:
- Registrierungsformular (name, email, age, newsletter) mit `mat-form-field`
  + `matInput` + `[formField]`. Model: `signal<Registration>({...})`.
- Schema mit `required`, `email`, `min(18)` + eigenen Fehlermeldungen,
  Fehler über `mat-error`.
- Rechts: StateInspector mit Live-Model-JSON und Flags (valid, dirty, touched,
  errors) – direkt als Signals gelesen, kein subscribe.
- Button „Set model programmatically“ zeigt, dass Model → Form synchron ist.
Before/After: Reactive Forms (FormGroup + valueChanges.subscribe) vs. Signal Forms.

────────────────────────────────────────────────────────────────
002 · validation · „Validation Patterns“
Takeaway: „Rules in the schema, subscriptions out!“
Key points: Built-in validators (required, email, min, max, minLength, pattern) ·
Conditional fields with `when` · Cross-field checks with `validate` + `valueOf` ·
Custom rule functions returning `{ kind, message }` or null · Async `validateHttp`
with built-in debounce and `pending`.
Demo: Ein Formular, fünf klar beschriftete Abschnitte (mat-card je Pattern):
1. Basics: username (minLength 3, pattern), email, age (min/max).
2. Conditional: Checkbox „I'm signing up for a company“ → Feld „Company name“
   wird erst dann required (`when`).
3. Cross-field: password + confirm password (validate + valueOf).
4. Custom rule: Funktion `noReservedWords` (z. B. „admin“, „test“).
5. Async: `validateHttp` gegen `/api/usernames/:name/available` mit `debounce`
   direkt am Validator (Wert sichtbar einstellbar 0–1000 ms); während `pending`
   ein `mat-progress-spinner` im Suffix; Request-Zähler zeigt, wie Debounce
   Requests spart; veraltete Antworten werden nicht übernommen.
Before/After: AsyncValidator-Klasse mit switchMap vs. `validateHttp`.

────────────────────────────────────────────────────────────────
003 · dynamic-arrays · „Dynamic Forms with Arrays“
Takeaway: „An array in a signal instead of FormArray!“
Key points: Array lives in the model · Immutable updates (update + spread /
filter) · Render with `@for` over the array field + `[formField]` · `applyEach`
validates every row.
Demo: Adressliste (street, zip, city, country als mat-select). Buttons: „Add
address“, pro Zeile „Duplicate“, „Remove“, „Move up/down“ (oder CDK DragDrop
zum Umsortieren). `applyEach` validiert jede Zeile (z. B. zip pattern). Zeilen mit
Fehlern rot markiert, Zähler „2 of 4 rows invalid“, Gesamt-`valid` reagiert.
StateInspector zeigt das reine Array im Model.
Before/After: FormArray mit Casts (`as FormGroup`) vs. Signal-Array.

────────────────────────────────────────────────────────────────
004 · custom-controls · „Custom Controls with model()“
Takeaway: „value with model, bind with formField, done!“
Key points: Implement `FormValueControl<T>` with `value = model()` · `value.set()`
on interaction · Bind like a native input with `[formField]` · `disabled`,
`touched`, `errors` as inputs, filled by Signal Forms.
Demo:
- `StarRatingComponent` (1–5 Sterne, Material Icons, Tastatur: Pfeiltasten,
  Home/End; `role="radiogroup"`, Hover-Vorschau), implementiert
  `FormValueControl<number>`.
- Zweites Control: `TagInputComponent` (`FormValueControl<string[]>`) auf Basis
  von `mat-chip-grid`.
- Eltern-Formular „Product review“ (title, rating, tags, comment) bindet beide
  mit `[formField]`; Schema: rating min 1, tags maxLength 5; Toggle
  „Disable rating“ via Schema-`disabled(when …)` zeigt, dass `disabled` automatisch
  ankommt; Fehler werden im Control angezeigt.
Before/After: ControlValueAccessor (writeValue, registerOnChange, registerOnTouched,
NG_VALUE_ACCESSOR-Provider) vs. `model()`.

────────────────────────────────────────────────────────────────
005 · testing-forms · „Testing Signal Forms with Vitest“
Takeaway: „Set the model, read the state – no fakeAsync, no tick.“
Key points: Vitest is the default runner (unit-test builder, Vite pipeline) ·
Runs in Node with jsdom/happy-dom, container-ready · Test forms synchronously via
model signal + valid/errors/dirty · Real interaction via Testing Library or
Vitest Browser Mode with Playwright.
Demo:
- Kleines Login-Formular als „System under test“.
- „Test scenarios“-Panel: eine Liste von Szenarien (z. B. „empty email → invalid“,
  „valid input → submit enabled“), die per Button im Browser ausgeführt werden:
  Model setzen, State lesen, Ergebnis ✓/✗ anzeigen – exakt die Logik der echten
  Spec-Datei, aber sichtbar.
- Code-Tab zeigt die ECHTE Spec-Datei dieser Seite (`login-form.spec.ts`) und den
  angular.json-Ausschnitt des `unit-test`-Builders sowie `ng test --no-watch` für CI.
Before/After: Karma + fakeAsync/tick vs. Vitest synchron.

────────────────────────────────────────────────────────────────
006 · auto-save · „Auto-Save & Form State (Dirty/Reset)“
Takeaway: „State as signals, save with debounce, then reset!“
Key points: dirty/touched/valid are signals · `canDeactivate` guard checks dirty ·
Auto-save via `toObservable(model)` + `debounceTime(500)` → API · `reset()` after a
successful save → pristine again.
Demo:
- „Profile settings“-Formular (display name, bio, language, notifications).
- Toggle „Auto-save“ (on/off). Status-Zeile: „Unsaved changes“ / „Saving…“ /
  „Saved at 21:34:05“ / „Save failed – retry“ (Fehlerquote aus Network-Panel).
- Manueller Save-Button nur aktiv, wenn dirty && valid.
- Funktionaler `canDeactivate`-Guard (inject im Guard) öffnet einen `MatDialog`
  „Discard unsaved changes?“ – zum Ausprobieren Link „Leave this page“.
- EventLog zeigt jeden Save-Call mit Payload und Zeitpunkt.
Before/After: valueChanges.subscribe ohne Cleanup + manuelles dirty-Flag vs. Signals.

────────────────────────────────────────────────────────────────
007 · tips-and-tricks · „Signal Forms: 5 Pro Tips“
Takeaway: „Which tip was new to you?“ (Banner: „Five tips, cleaner forms.“)
Key points: Type your model with an interface · Logic in the schema: `disabled`,
`readonly`, `hidden` with `when` (skip validation) · Debounce only on the async
validator · `submit()` marks all as touched and only runs when valid · UI flags
in `computed`, not in the model.
Demo: `mat-accordion` mit fünf Panels, jedes eine Mini-Demo:
1. Typed model (Interface mit optionalen Feldern, Backend-Payload-Typ).
2. Checkbox „Ship to a different address“ → Felder hidden/disabled/readonly
   per Schema; Nachweis, dass versteckte Felder nicht validiert werden.
3. Required reagiert sofort, async check erst nach Debounce (zwei Zähler).
4. Submit: leeres Formular absenden → alle Fehler erscheinen; Aktion läuft
   nur bei valid (EventLog).
5. `isSaving`/`canSubmit` als `computed` neben dem Model.

────────────────────────────────────────────────────────────────
008 · migration-old-vs-new · „Migration: Reactive vs. Signal Forms“
Takeaway: „Less boilerplate, zero leaks!“
Key points: Before: FormBuilder, nested FormGroups, takeUntilDestroyed per
stream · After: interface + signal + `form()` + `[formField]` · Old and new
coexist in one app · No manual subscriptions → no leaks · Zoneless-ready.
Demo:
- DASSELBE „Order“-Formular (Produkt, Menge, Einzelpreis, Rabatt, abgeleitete
  Gesamtsumme) zweimal nebeneinander: links Reactive Forms (echt lauffähig, mit
  FormBuilder + takeUntilDestroyed), rechts Signal Forms (computed total).
- Metriken: Lines of code (aus den Snippets gezählt), Anzahl Subscriptions,
  Typ-Sicherheit (Badge).
- Hinweisbox „Migration strategy“: neue Features sofort mit Signal Forms,
  bestehende Formulare mit vielen abgeleiteten Werten zuerst migrieren.

────────────────────────────────────────────────────────────────
009 · big-tables · „Angular 22 & Big Tables“
Takeaway: „Only render what users see!“
Key points: Rows × columns = DOM nodes · Few rows: plain table with `@for` + track ·
Paging only hides the problem · CDK virtual scroll (fixed row height, sort/filter
on you) · Grid frameworks virtualize both directions (ag-Grid, GUI Expert Table).
Demo:
- Steuerleiste: Zeilenanzahl (100 / 1 000 / 10 000 / 100 000), Spalten (5 / 10),
  Modus als `mat-button-toggle-group`:
  a) Plain `@for` table (bei > 10 000 Zeilen Warn-Dialog „This may freeze your tab“)
  b) `mat-table` + `mat-paginator` + `mat-sort`
  c) CDK virtual scroll (`cdk-virtual-scroll-viewport`, fixe Zeilenhöhe,
     Sortierung/Filter als `computed`)
- MetricTiles: DOM-Knoten im Tabellenbereich, Render-Zeit (performance.now um
  den Wechsel, gemessen mit `afterNextRender`), FPS beim Scrollen.
- Info-Karte zu Grid-Frameworks (ag-Grid, GUI Expert Table – MIT, > 1 Mio. Zeilen)
  mit Links; Hinweis „Full disclosure: GUI Expert is the author's project.“
  OPTIONAL: GUI Expert Table als vierter Modus, nur wenn das Paket mit Angular 22
  kompatibel ist und ohne Hacks läuft; sonst nur die Info-Karte.

────────────────────────────────────────────────────────────────
010 · look-and-feel · „Look & Feel with Material Theming“
Takeaway: „Material, your own theme and CSS custom properties!“
Key points: Three paths: custom CSS, UI library, Angular Material · Design tokens
as CSS variables (e.g. `--mat-sys-primary`) instead of hacks · Plain CSS for simple
overrides, SCSS for reusable themes and `*-overrides` mixins · Material has its own
look – fully custom branding may need another path.
Demo: „Theme playground“:
- Linke Spalte Controls: Primärfarbe (Color-Picker + Presets), Corner Radius
  (Slider → `--mat-sys-corner-*`), Dichte (−3…0, per vorkompilierten
  Klassen), Schrift (2–3 System-Fonts), Light/Dark.
- Werte als Signals → `[style.--mat-sys-primary]` etc. auf einem Preview-Container
  (kein globales Überschreiben, nur im Scope der Vorschau).
- Rechte Spalte Preview: Buttons (filled/tonal/outlined/text), Card, Form-Field,
  Chips, Slide-Toggle, Tabs, Snackbar-Trigger.
- Token-Tabelle: welche `--mat-sys-*`-Variable welchen aktuellen Wert hat.
- Ein Beispiel mit `mat.button-overrides(...)` in SCSS (im Code-Tab erklärt).
Before/After: `::ng-deep .mat-mdc-button { … !important }` vs. Tokens/Overrides.

────────────────────────────────────────────────────────────────
011 · zoneless · „Zoneless Angular (Bye bye zone.js)“
Takeaway: „Signals instead of zones!“
Key points: One provider `provideZonelessChangeDetection()`, zone.js out of
polyfills · Re-render on signal change, template events, new inputs · No monkey
patching – setTimeout doesn't trigger change detection · Zoneless default since
v21; new v22 projects are zoneless + OnPush by default.
Demo:
- Badge „zone.js loaded: no“ (Prüfung `typeof globalThis.Zone === 'undefined'`).
- Zwei Zähler nebeneinander, beide per `setTimeout`/`setInterval` erhöht:
  a) normales Klassenfeld → UI bleibt stehen (bewusst „falsch“),
  b) Signal → UI aktualisiert sich. Button „Click anywhere“ zeigt, dass ein
  Template-Event den alten Zähler „nachzieht“.
- Render-Zähler pro Komponente (Zähler in `afterEveryRender`/`afterRenderEffect`)
  sichtbar machen: Was löst wirklich ein Rendering aus?
- Code-Tab: app.config.ts, angular.json (polyfills ohne zone.js).

────────────────────────────────────────────────────────────────
012 · resource · „Data Fetching with resource() & rxResource()“
Takeaway: „Fetch data without subscribe!“
Key points: `resource({ params, loader })` with abortSignal · value, status,
isLoading, error are signals · Auto re-fetch on param change, old request
cancelled · `rxResource` for Observables, `httpResource` for simple GET ·
Resources are for reading – writes via HttpClient post/put/patch/delete.
Demo:
- User-Suche (Suchfeld + Pagination) gegen `/api/users`. Umschalter
  (`mat-button-toggle-group`): resource / rxResource / httpResource – gleiche UI,
  drei Implementierungen.
- Status-Anzeige: status als Chip (idle/loading/reloading/resolved/error/local),
  isLoading-Spinner, error-Box mit „Retry“ (`reload()`), value als Liste.
- Schnell tippen → Request-Log zeigt „cancelled“ für veraltete Requests.
- „Create user“-Dialog → `HttpClient.post`, danach `reload()`; optional
  optimistisches `value.update(...)` (lokaler Status).

────────────────────────────────────────────────────────────────
013 · virtual-scrolling · „High-Performance Virtual Scrolling“
Takeaway: „Only render what users see!“
Key points: Only visible rows + buffer in the DOM, rows recycled · `itemSize`,
`minBufferPx`, `maxBufferPx` · Signals as data source, filter/sort via `computed` ·
trackBy keeps rows stable – ~30 rows in DOM, 60 FPS.
Demo:
- 100 000 generierte Einträge (Name, Stadt, Score, Avatar-Initialen).
- Filter (Textfeld) und Sortierung (mat-select) als `computed`.
- Slider für itemSize, minBufferPx, maxBufferPx → wirken sofort.
- MetricTiles: Einträge gesamt, gefilterte Einträge, gerenderte DOM-Zeilen
  (live gemessen), FPS beim Scrollen, Index sichtbarer Bereich
  (`scrolledIndexChange` → Signal).
- Buttons „Scroll to top / to 50 000 / to end“ (`scrollToIndex`).
- Verweis-Link auf Video 009.

────────────────────────────────────────────────────────────────
014 · view-transitions · „Native App Animations with View Transitions“
Takeaway: „One switch, and your app feels native!“
Key points: `withViewTransitions()` on provideRouter → crossfade (developer preview) ·
Element morphing with shared `view-transition-name` · Duration/easing in GLOBAL
styles (view encapsulation!) · Progressive enhancement (~92 % support).
Demo:
- Kindrouten unter dieser Seite: `…/014-view-transitions` (Produktliste als Grid)
  und `…/014-view-transitions/:id` (Detailansicht). Produkte haben farbige
  Kacheln/Emoji statt Fotos.
- Kachel und Detail-Header teilen dynamisch `view-transition-name: product-{{id}}`
  → Morphing.
- Controls: Toggle „Enable view transitions“ (über `onViewTransitionCreated` →
  `transition.skipTransition()`), Slider Dauer (→ CSS-Variable, in
  `styles/view-transitions.scss` genutzt), Easing-Auswahl.
- Badge „Supported in this browser: yes/no“ (`'startViewTransition' in document`).
- `prefers-reduced-motion` → Transitions aus.
- API-Status: Developer Preview (Router-Integration) – per Typings prüfen.

────────────────────────────────────────────────────────────────
015 · let-syntax · „Clean Templates with @let“
Takeaway: „Name it once, read it everywhere!“
Key points: `@let fullName = first + ' ' + last;` · Compute once, use many times ·
Works with async pipe (replaces `*ngIf … as`) · Read-only, block-scoped, updates
automatically · For conditional rendering still use `@if`.
Demo:
- Warenkorb mit editierbaren Mengen; im Template `@let subtotal`, `@let tax`,
  `@let total`, `@let isFreeShipping` – mehrfach verwendet.
- `@let ticker = price$ | async;` mit einem Observable (interval) – Vergleich zum
  alten `*ngIf as`-Workaround im Before/After.
- Kleine „Rules“-Box mit Beispiel, warum `@let` read-only und block-scoped ist
  (zwei Blöcke mit gleichem Namen).

────────────────────────────────────────────────────────────────
016 · defer · „Performance Boost with @defer“
Takeaway: „Only load what's needed!“
Key points: Wrap in `@defer` → separate chunk · Triggers: `on viewport`,
`on interaction`, default `on idle` · `@placeholder`, `@loading`, `@error` ·
`prefetch on idle` · Component must be standalone and not referenced outside
the block in the same file.
Demo: Lange Seite mit vier Bereichen:
1. „Heavy chart“ (eigene SVG/Canvas-Chart-Komponente mit großem Datensatz)
   `@defer (on viewport)` mit `@placeholder (minimum 500ms)` und
   `@loading (after 100ms; minimum 1s)`.
2. „Rich text editor“ (eigene einfache Editor-Komponente) `@defer (on interaction)`.
3. „Help dialog content“ `@defer (on hover; prefetch on idle)`.
4. `@defer (when showReport())` mit Toggle.
- EventLog: jede deferred Komponente loggt bei Init „chunk loaded at …“.
- Hinweis-Karte „Check the Network tab“ + Liste der erzeugten Lazy-Chunks
  aus dem Build (statisch in README dokumentieren).

────────────────────────────────────────────────────────────────
017 · signal-component-api · „Signal Component API“
Takeaway: „Inputs, outputs, queries – all signals!“
Key points: `input()` / `input.required()` checked by the compiler · `output()`
replaces EventEmitter, `emit` unchanged · `viewChild` / `contentChildren` as
signals, no timing issues · `computed` instead of ngOnChanges, `effect` for side
effects · Bonus: `model()` for two-way binding `[( )]`.
Demo: Parent/Child-Playground:
- Child `UserCardComponent`: `name = input.required<string>()`,
  `highlighted = input(false, { transform: booleanAttribute })`,
  `selected = output<string>()`, `rating = model(0)`,
  `initials = computed(...)`, `nameInput = viewChild<ElementRef>('nameInput')`
  (Button „Focus input“), `tags = contentChildren(TagDirective)` (Anzahl angezeigt).
- Parent-Steuerpanel ändert Inputs live, zeigt Outputs im EventLog, bindet
  `[(rating)]` (Banana in a Box) und zeigt den gemeinsamen Wert.
- `effect` loggt Änderungen (nur Logging = Seiteneffekt).
- Hinweis auf die Migrations-Schematics (`ng g @angular/core:signal-input-migration`,
  `…:output-migration`, `…:signal-queries-migration` – Namen prüfen).
Before/After: @Input/@Output/@ViewChild + ngOnChanges/ngAfterViewInit.

────────────────────────────────────────────────────────────────
018 · signal-state · „Lightweight State Management with Signals“
Takeaway: „One signal, a few methods, and that's your store!“
Key points: State is a private signal in a service · Read-only outside via
`asReadonly()` / computed selectors · Updates as methods (`addTodo`, `reset`) ·
Global (`providedIn: 'root'`) vs. feature (component `providers`).
Demo:
- `TodoStore` (~20 Zeilen Kernlogik, im Code-Tab vollständig): private
  `#state = signal<TodoState>(…)`, `todos = computed`, `remaining = computed`,
  `filter`, Methoden add/toggle/remove/clearCompleted/reset.
- Todo-UI (Liste, Filter-Chips all/active/done, Zähler).
- Abschnitt „Global vs. feature state“: zwei Instanzen der gleichen
  Widget-Komponente – einmal mit Root-Store (teilen State), einmal mit eigenem
  `providers: [TodoStore]` (unabhängig). Live sichtbar.
- Info-Karte: wann NgRx / NgRx SignalStore sinnvoll ist (große Teams, DevTools,
  komplexe Effects).

────────────────────────────────────────────────────────────────
019 · signal-patterns · „Signal & Resource Patterns Cheat Sheet“
Takeaway: „The right pattern for every job!“
Key points: Derive: `computed`, `linkedSignal` (settable), `equal` option ·
`effect` only for side effects (localStorage, logging, external APIs) · Async
reads: resource / httpResource / rxResource, abortSignal, chain, `stream` option ·
Delay: `debounced` (new, experimental) – throttling via RxJS `throttleTime` ·
Resources are reads, not a cache; SSR: id + TransferState.
Demo: Interaktiver Spickzettel als Grid von Karten, jede mit Mini-Demo:
- computed (Preis × Menge), linkedSignal (Auswahl setzt sich zurück, wenn die
  Optionsliste wechselt, kann aber manuell überschrieben werden), `equal`
  (Recompute-Zähler mit/ohne custom equal).
- effect → localStorage-Persistenz einer Einstellung.
- resource mit `stream` → simulierter WebSocket-Ticker.
- `debounced` (falls in v22 vorhanden, als Experimental markiert) vs.
  `throttleTime` via `toObservable`/`toSignal`.
- „Which pattern do I need?“-Entscheidungshilfe (mat-stepper oder Frage-Baum),
  die am Ende das passende Pattern + Snippet empfiehlt.

────────────────────────────────────────────────────────────────
020 · http-interceptors · „HTTP Interceptors, HttpContext & Error Handling“
Takeaway: „Cross-cutting logic belongs in the interceptor!“
Key points: Functional interceptors via `provideHttpClient(withInterceptors([...]))` ·
Auth + error handling in one place (401/500) · `HttpContextToken` flags per request
(skip token, skip spinner) · Route-level HttpClient with own interceptors +
`withRequestsMadeViaParent()`.
Demo:
- Interceptors (alle funktional, in `core/http`): `authInterceptor`
  (Bearer-Token aus `AuthStore`-Signal), `errorInterceptor` (401 → Snackbar
  „Session expired“ + Token löschen; 5xx → Snackbar mit Retry), `loadingInterceptor`
  (aktiver-Requests-Zähler-Signal → globale Progressbar), `loggingInterceptor`.
- Context-Tokens: `SKIP_AUTH`, `SKIP_LOADING`.
- Buttons: „GET ok“, „GET 401“, „GET 500“, „GET without token (SKIP_AUTH)“,
  „GET silently (SKIP_LOADING)“, „Login/Logout“ (Token setzen/löschen).
- Request-Inspector-Tabelle (aus RequestLog): sichtbare Header pro Request.
- Diese Route stellt in ihren `providers` einen EIGENEN HttpClient bereit
  (`provideHttpClient(withInterceptors([featureHeaderInterceptor]),
  withRequestsMadeViaParent())`) → im Inspector sieht man zusätzlich
  `X-Feature: interceptors-demo`, und die globalen Interceptors laufen trotzdem.
Before/After: Klassen-Interceptor + `HTTP_INTERCEPTORS` multi:true.

────────────────────────────────────────────────────────────────
021 · vitest-bindings · „Component Tests with Vitest & the Bindings API“
Takeaway: „Bind inputs as signals, catch outputs, done!“
Key points: Vitest default runner · `inputBinding` connects an input to a signal
in `TestBed.createComponent` · `outputBinding` → function / `vi.fn()` spy ·
Signals & resources: set signal, `await fixture.whenStable()`, HttpTestingController.
Demo:
- Komponente unter Test: `QuantityStepperComponent` (input min/max/step,
  `model` value, output `limitReached`) + `UserBadgeComponent` mit httpResource.
- Live-Bereich: beide Komponenten bedienbar.
- „Test explorer“: zeigt die Testfälle der echten Spec-Dateien als Liste mit
  Beschreibung und Code (Spec-Dateien existieren wirklich und laufen in `ng test`):
  `inputBinding('min', minSignal)`, `outputBinding('limitReached', spy)`,
  `twoWayBinding('value', valueSignal)` (falls vorhanden),
  HttpTestingController für den Resource-Test.
Before/After: Test-Host-Komponente + `setInput` + `detectChanges` vs. Bindings API.

────────────────────────────────────────────────────────────────
022 · dependency-injection · „Dependency Injection & Service Lifecycle“
Takeaway: „Decide where state lives, then provide it!“
Key points: `inject()` everywhere (also guards/interceptors) ·
`provideAppInitializer` (startup config) / `provideEnvironmentInitializer`
(per injector) · Route providers scope services to a feature; since 22.2
`withAutoCleanupInjectors` destroys them when the route is inactive · `DestroyRef`
for cleanup of connections/timers.
Demo:
- App-Config-Karte: Werte aus `/api/config`, geladen per `provideAppInitializer`
  (Ladezeit sichtbar).
- `LifecycleLogStore` (root) protokolliert Erzeugung/Zerstörung von Services.
- Kindrouten `…/022-dependency-injection/feature-a` und `/feature-b`, jede mit
  eigenem `FeatureSessionService` in Route-`providers` (Instanz-ID, Startzeit,
  laufender Timer mit DestroyRef-Cleanup) und `provideEnvironmentInitializer`,
  der loggt.
- Toggle „Auto cleanup injectors“: dokumentiert, dass `withAutoCleanupInjectors()`
  in `provideRouter` gesetzt ist (Verfügbarkeit ab 22.2 prüfen; falls nicht
  vorhanden → Experimental-Hinweis in API-NOTES, Demo zeigt dann das
  „lebt weiter“-Verhalten).
- Funktionaler Guard mit `inject()` (z. B. Feature-Flag aus Config).

────────────────────────────────────────────────────────────────
023 · bundle-optimization · „Bundle Analysis & Optimization“
Takeaway: „Measure first, then optimize!“
Key points: Measure with `ng build --stats-json` + esbuild analyzer or
source-map-explorer · Budgets in angular.json · Tree-shaking: precise imports,
no side-effect imports, ESM instead of CommonJS · Replace heavy libs with native
APIs like `Intl` · Load the rest on demand with `@defer`.
Demo:
- „How to measure“-Stepper mit kopierbaren Befehlen (npm run analyze /
  analyze:sme) und Screenshot-freier Erklärung.
- Budget-Karte: liest die Budgets dieses Projekts (zur Buildzeit als JSON
  importiert oder als Konstante gepflegt) und zeigt sie an.
- „Native instead of library“-Playground: `Intl.DateTimeFormat`,
  `Intl.RelativeTimeFormat`, `Intl.NumberFormat` (Währung, kompakt),
  `Intl.ListFormat`, `Intl.PluralRules` – Locale-Auswahl, Live-Ausgabe; daneben
  typische Library-Größen als statische Vergleichstabelle (mit Hinweis
  „approximate, check bundlephobia“).
- On-demand-Import: Button lädt per `import()` ein „heavy“ Modul und zeigt
  Ladezeit und Chunk-Namen.

────────────────────────────────────────────────────────────────
024 · migrate-legacy-app · „Migrating a Legacy App to Angular 22“
Takeaway: „Small steps instead of a big bang!“
Key points: `ng update` one major at a time, follow angular.dev/update-guide ·
Standalone migration · Control flow + inject migrations · Signal inputs/outputs/
queries migrations · After every step: build, test, commit.
Demo:
- „Upgrade planner“: Auswahl der aktuellen Version (12–21) → generierte Liste
  der `ng update @angular/core@X @angular/cli@X`-Schritte bis 22 (inkl.
  Material/CDK), je Schritt Checkbox; Fortschritt als Signal (+ localStorage).
- `mat-stepper` mit den Migrationsschritten (standalone, control-flow,
  inject, signal-input, output, signal-queries, cleanup-unused-imports);
  je Schritt: Befehl (Schematic-Namen gegen `ng generate @angular/core: --help`
  prüfen), Before/After-Snippet, „Build · Test · Commit“-Checkliste.

────────────────────────────────────────────────────────────────
025 · review-ai-code · „Reviewing AI-Generated Angular Code“
Takeaway: „AI writes, you review!“
Key points: AI often produces outdated code (NgModules, ngIf, @Input, subscribe
without cleanup) · Spot outdated APIs: constructor injection, BehaviorSubject
instead of signals, missing `track` · Verify unknown APIs on angular.dev
(hallucinations) · Give it rules: official `best-practices.md` · Use the Angular
CLI MCP server.
Demo:
- „AI code checker“: Textarea (oder Code-Feld) mit vorausgefülltem,
  typischem KI-Code. Ein regelbasierter Analyzer (reine TS-Funktionen, gut
  getestet) findet Muster: `@NgModule`, `*ngIf`/`*ngFor`, `@Input(`/`@Output(`,
  `constructor(private`, `BehaviorSubject`, `.subscribe(` ohne
  `takeUntilDestroyed`, `@for` ohne `track`, `ngClass`/`ngStyle`, `any`.
  Ergebnisse als Liste mit Zeilennummer, Schweregrad und Fix-Vorschlag.
- Button „Load example 1/2/3“ mit verschiedenen Beispielen; Score „Modernity: 4/10“.
- Karte „Give your assistant rules“: Hinweis auf `ng new --ai-config`,
  best-practices.md und `ng mcp` mit Beispiel-Konfiguration.
- Dieses Projekt selbst enthält die offizielle Rules-Datei für Claude
  (z. B. `.claude/CLAUDE.md` bzw. was `--ai-config` erzeugt).

────────────────────────────────────────────────────────────────
026 · resource-composition · „Resource Composition (chain & Snapshots)“
Takeaway: „Chain resources instead of nesting streams!“
Key points: `chain` in the params context reads the previous resource (e.g.
companyId) · Status propagation: second waits while first loads, inherits errors ·
Snapshots: status + value; `resourceFromSnapshots` builds a new resource ·
`linkedSignal` on the snapshot keeps old data while reloading – no flicker.
Demo:
- User-Auswahl (mat-select) → `userResource` → per `chain` → `companyResource`.
- Zwei Status-Karten nebeneinander (User / Company) mit Status-Chip, Spinner,
  Fehler. Network-Panel-Fehlerquote hochdrehen → Fehler propagiert sichtbar.
- Toggle „Keep previous data while reloading“: Vergleich Flackern vs.
  `linkedSignal`/Snapshot-Variante (zwei Panels nebeneinander).
- Snapshot-Inspector zeigt `snapshot()` live.
- WICHTIG: Exakte API (`chain`, `snapshot`, `resourceFromSnapshots`) gegen die
  installierten Typings prüfen; Abweichungen in API-NOTES, Status-Chip passend.
Before/After: switchMap-Kette mit manuellem Loading/Error je Schritt.

────────────────────────────────────────────────────────────────
027 · event-manager-plugins · „Event Manager Plugins“
Takeaway: „Write once, use everywhere!“
Key points: Built-in plugin already powers `keyup.enter`, `keydown.shift.tab` ·
Own plugin extends `EventManagerPlugin`: `supports()` + `addEventListener()`
returning a cleanup function · Register via `EVENT_MANAGER_PLUGINS` multi ·
Use anywhere: `(input.debounce.500)="…"` – always return cleanup.
Demo:
- `DebounceEventPlugin` (in `core/events`), unterstützt `<event>.debounce.<ms>`;
  optional zweites Plugin `<event>.throttle.<ms>`.
- Zwei Suchfelder nebeneinander: `(input)` vs. `(input.debounce.500)`, je ein
  Zähler „handler calls“ – deutlicher Unterschied beim Tippen.
- Slider zeigt verschiedene Werte (`.debounce.200`, `.500`, `.1000`) über
  mehrere vorgefertigte Felder (Event-Namen sind statisch im Template).
- Built-in-Demo: `(keydown.enter)`, `(keydown.shift.tab)`, `(keydown.control.k)`.
- Leak-Check: Komponente per Toggle zerstören/erzeugen; Zähler aktiver Listener
  (vom Plugin gepflegt) fällt auf 0 → Cleanup funktioniert.
Before/After: ViewChild + fromEvent + debounceTime + Cleanup in jeder Komponente.

══════════════════════════════════════════════════════════════════════════════
7. TESTS (Vitest)
══════════════════════════════════════════════════════════════════════════════

Pflicht-Tests (mindestens):
- Katalog: 27 Einträge, eindeutige `num`/`slug`, jede Route lädt eine Komponente.
- Routing: jede Video-URL rendert ihre Seite (parametrisierter Test über den
  Katalog mit `RouterTestingHarness`), Title wird korrekt gesetzt, 404 für unbekannte URLs.
- Shell: Suche filtert, Theme-Toggle setzt color-scheme, Prev/Next korrekt.
- Fake-Backend: Latenz, Fehlerquote (mit `vi.useFakeTimers()` und deterministischem
  Zufall), Abbruch → „cancelled“ im Log.
- 001–008: Validierungsregeln (required, cross-field, when, applyEach, custom,
  validateHttp mit HttpTestingController), StarRating als FormValueControl,
  canDeactivate-Guard, Auto-Save mit Fake-Timern.
- 012/026: Resource-Status-Übergänge inkl. Abbruch und Fehler-Propagation.
- 018: TodoStore vollständig.
- 020: jeder Interceptor einzeln + Context-Tokens.
- 021: Bindings-API-Tests (inputBinding/outputBinding).
- 025: Analyzer-Regeln (positiv + negativ je Regel).
- 027: DebounceEventPlugin (supports, Debounce-Verhalten, Cleanup).
Regeln: keine `fakeAsync`/`tick` (zoneless), stattdessen `await fixture.whenStable()`
und `vi.useFakeTimers()`/`vi.advanceTimersByTimeAsync()`. Keine Snapshot-Tests
von ganzen Templates. Tests deterministisch, ohne Netzwerk.

══════════════════════════════════════════════════════════════════════════════
8. DOKUMENTATION
══════════════════════════════════════════════════════════════════════════════

- README.md (Englisch): Ziel, Tech-Stack, Setup (`npm ci`, `npm start`), alle
  Skripte, Tabelle aller 27 Routen (Nr., Titel, URL, API-Status, Kategorie),
  Architekturüberblick, Fake-Backend-Erklärung, Hinweise zu Experimental-APIs.
- docs/API-NOTES.md: Abweichungen zwischen Video-Skript und installierter API.
- Jede Seite: kurzer JSDoc-Kommentar oben mit Bezug auf das Video.

══════════════════════════════════════════════════════════════════════════════
9. DEFINITION OF DONE
══════════════════════════════════════════════════════════════════════════════

[ ] `npm ci && npm run ci` läuft fehlerfrei (lint, test, build) – keine Warnungen
    im Build außer begründeten.
[ ] Alle 27 Routen erreichbar, lazy geladen (eigener Chunk je Seite), mit Titel,
    Key Points, Live-Demo, Code-Tab, Takeaway, Prev/Next.
[ ] Jede Live-Demo zeigt genau die Kernaussagen des jeweiligen Videos und ist
    interaktiv (nicht nur Text).
[ ] Code-Snippets im Code-Tab entsprechen dem tatsächlich laufenden Code.
[ ] Kein zone.js im Bundle, keine Decorator-Inputs/Outputs, keine *ngIf/*ngFor,
    keine Constructor-Injection, kein `any`, kein `::ng-deep`, kein `!important`
    (per ESLint-Regeln bzw. grep im Abschluss verifizieren).
[ ] Light- und Dark-Mode sauber, responsive ab 360 px, Tastaturbedienung,
    keine Console-Errors oder -Warnings beim Durchklicken aller Seiten.
[ ] Initial-Bundle innerhalb der Budgets.
[ ] docs/API-NOTES.md enthält alle API-Abweichungen; Experimental/Preview-APIs
    sind in der UI gekennzeichnet.
[ ] README mit Routen-Tabelle.

Abschluss: Führe am Ende einen Self-Review durch (Checkliste oben Punkt für Punkt,
mit Belegen: Befehlsausgaben, grep-Ergebnisse) und liste offene Punkte ehrlich auf.
```

---

## Hinweise zur Ausführung
- Am besten in einem leeren Ordner neben diesem Repo ausführen und den Ordner `videos/` (nur `scripts_text/script_en.txt` und `video.json`) als Kontext verfügbar machen.
- Der Prompt ist bewusst in Phasen aufgeteilt. Wenn der Agent das Kontextfenster ausreizt, kannst du die Phasen B–D auch als separate Runs starten („Setze Phase C aus Prompt 07 um“).
- Die Angular-22-spezifischen APIs (Signal Forms, Resource `chain`/Snapshots, `debounced`, `withAutoCleanupInjectors`) muss der Agent gegen die installierten Typings prüfen – Abweichungen landen in `docs/API-NOTES.md`, statt geraten zu werden.
