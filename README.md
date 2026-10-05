# Angular 22 Demos

One interactive, lazy-loaded demo page for each of the **27 videos** of the YouTube series
“Angular 22”. Every page shows a live demo, the real source code that runs it (Code tab),
a before/after comparison where the video has one, and the video's “Remember” takeaway.

- **Angular 22.2** – standalone, zoneless, OnPush by default, signals everywhere
- **Angular Material 3** – design tokens, light/dark via `color-scheme`
- **Signal Forms** (`@angular/forms/signals`) with `[formField]`
- **Vitest** via the Angular `unit-test` builder (jsdom, no browser needed)
- In-memory **fake backend** (HTTP interceptor) – no server, no external API

## Quick start

```bash
npm ci
npm start            # http://localhost:4200
```

> The repository's `node_modules` must match your OS. If you copied the folder from another
> machine, run `rm -rf node_modules && npm ci`.

## Scripts

| Script                            | What it does                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm start`                       | `ng serve` (runs `npm run snippets` first)                                                                           |
| `npm run build`                   | Production build (`ng build`)                                                                                        |
| `npm test`                        | `ng test --no-watch` – Vitest in Node/jsdom, CI-friendly                                                             |
| `npm run test:watch`              | Vitest watch mode                                                                                                    |
| `npm run test:coverage`           | Tests with coverage (thresholds: 80 % statements/lines/functions, 75 % branches)                                     |
| `npm run lint`                    | `ng lint` (angular-eslint, typed rules)                                                                              |
| `npm run format` / `format:check` | Prettier + organize-imports                                                                                          |
| `npm run analyze`                 | `ng build --stats-json` → drop `dist/angular22-video-demos/browser-stats.json` on https://esbuild.github.io/analyze/ |
| `npm run analyze:sme`             | Build with source maps and open source-map-explorer                                                                  |
| `npm run snippets`                | Regenerates the per-video `sources.generated.ts` files (runs automatically before start/build/test)                  |
| `npm run ci`                      | lint + test + build                                                                                                  |

## The 27 routes

| #   | Title                                           | URL                                 | API status        | Category                |
| --- | ----------------------------------------------- | ----------------------------------- | ----------------- | ----------------------- |
| 001 | Signal Forms: Getting Started                   | `/videos/001-signal-forms-intro`    | Stable            | Signal Forms            |
| 002 | Validation Patterns                             | `/videos/002-validation`            | Stable            | Signal Forms            |
| 003 | Dynamic Forms with Arrays                       | `/videos/003-dynamic-arrays`        | Stable            | Signal Forms            |
| 004 | Custom Controls with model()                    | `/videos/004-custom-controls`       | Stable            | Signal Forms            |
| 005 | Testing Signal Forms with Vitest                | `/videos/005-testing-forms`         | Stable            | Signal Forms            |
| 006 | Auto-Save & Form State (Dirty/Reset)            | `/videos/006-auto-save`             | Stable            | Signal Forms            |
| 007 | Signal Forms: 5 Pro Tips                        | `/videos/007-tips-and-tricks`       | Stable            | Signal Forms            |
| 008 | Migration: Reactive vs. Signal Forms            | `/videos/008-migration-old-vs-new`  | Stable            | Signal Forms            |
| 009 | Angular 22 & Big Tables                         | `/videos/009-big-tables`            | Stable            | Data & UI               |
| 010 | Look & Feel with Material Theming               | `/videos/010-look-and-feel`         | Stable            | Data & UI               |
| 011 | Zoneless Angular (Bye bye zone.js)              | `/videos/011-zoneless`              | Stable            | Reactivity & Signals    |
| 012 | Data Fetching with resource() & rxResource()    | `/videos/012-resource`              | Stable            | Reactivity & Signals    |
| 013 | High-Performance Virtual Scrolling              | `/videos/013-virtual-scrolling`     | Stable            | Data & UI               |
| 014 | Native App Animations with View Transitions     | `/videos/014-view-transitions`      | Developer Preview | Data & UI               |
| 015 | Clean Templates with @let                       | `/videos/015-let-syntax`            | Stable            | Templates & Performance |
| 016 | Performance Boost with @defer                   | `/videos/016-defer`                 | Stable            | Templates & Performance |
| 017 | Signal Component API                            | `/videos/017-signal-component-api`  | Stable            | Reactivity & Signals    |
| 018 | Lightweight State Management with Signals       | `/videos/018-signal-state`          | Stable            | Reactivity & Signals    |
| 019 | Signal & Resource Patterns Cheat Sheet          | `/videos/019-signal-patterns`       | Experimental      | Reactivity & Signals    |
| 020 | HTTP Interceptors, HttpContext & Error Handling | `/videos/020-http-interceptors`     | Stable            | Architecture & HTTP     |
| 021 | Component Tests with Vitest & the Bindings API  | `/videos/021-vitest-bindings`       | Stable            | Testing & Tooling       |
| 022 | Dependency Injection & Service Lifecycle        | `/videos/022-dependency-injection`  | Stable            | Architecture & HTTP     |
| 023 | Bundle Analysis & Optimization                  | `/videos/023-bundle-optimization`   | Stable            | Templates & Performance |
| 024 | Migrating a Legacy App to Angular 22            | `/videos/024-migrate-legacy-app`    | Stable            | Testing & Tooling       |
| 025 | Reviewing AI-Generated Angular Code             | `/videos/025-review-ai-code`        | Stable            | Testing & Tooling       |
| 026 | Resource Composition (chain & Snapshots)        | `/videos/026-resource-composition`  | Experimental      | Reactivity & Signals    |
| 027 | Event Manager Plugins                           | `/videos/027-event-manager-plugins` | Stable            | Architecture & HTTP     |

`/videos/001` (number only) redirects to the full URL. Unknown URLs show a 404 page.

## Architecture

```
src/app
├─ app.ts / app.html            Shell: toolbar (search, theme, network), sidenav, outlet
├─ app.config.ts                Router features, HttpClient + interceptors, initializers, plugins
├─ app.routes.ts                Generated from the catalog (one lazy route per video)
├─ core/
│  ├─ catalog/                  VIDEO_CATALOG – single source of truth (27 entries)
│  ├─ fake-backend/             fakeBackendInterceptor, deterministic seed data, network panel
│  ├─ http/                     auth / logging / loading / error interceptors, HttpContext tokens
│  ├─ events/                   Debounce/Throttle EventManagerPlugins (video 027)
│  ├─ config/                   AppConfigStore (provideAppInitializer → /api/config)
│  ├─ theme/ layout/ search/    Signal stores for theme, breakpoints and search
│  ├─ view-transitions/         Runtime switches for withViewTransitions()
│  ├─ notify/                   Lazily loaded snackbar facade
│  └─ generated/                build-info.generated.ts (budgets, scripts) – generated
├─ shared/                      DemoPage, CodeViewer (+ tiny highlighter), BeforeAfter,
│                               StateInspector, MetricTile, EventLog, ApiStatusChip, FPS meter
├─ pages/                       Home (grid, filters) and NotFound
└─ videos/vNNN-<slug>/          One folder per video: page, snippets, spec, generated sources
```

**Code tab = running code.** `scripts/generate-sources.mjs` copies every `.ts/.html/.scss` file of a
video folder (plus files listed in its `sources.json`, e.g. `app.config.ts` or a slice of
`angular.json`) into `sources.generated.ts`. The Code tab renders those strings, so it can't drift
from what actually runs. A missing file throws in the tests.

**Conventions:** 2025 style-guide file names (`*.page.ts` for pages, no `.component` suffix),
`app-` selector prefix, `inject()` only, signal inputs/outputs/queries, `host: {}` instead of
host decorators, native control flow with `track`, no `any`, no `::ng-deep`, no `!important`.
Root singletons use the new `@Service()` decorator. ESLint enforces most of this (see
`eslint.config.js`).

## Fake backend

`fakeBackendInterceptor` is the **last** interceptor in the root chain, so auth → logging → loading
→ error run first. It answers every `/api/**` request from memory:

| Endpoint                                 | Notes                                                 |
| ---------------------------------------- | ----------------------------------------------------- |
| `GET /api/config`                        | Startup config (feature flags)                        |
| `GET /api/me`                            | 401 without `Authorization` header                    |
| `GET /api/users?q=&page=&pageSize=`      | Paginated search over 480 seeded users                |
| `GET /api/users/:id`, `POST /api/users`  | Create returns 201                                    |
| `GET /api/companies/:id`                 | For `chain()` (video 026)                             |
| `GET /api/usernames/:name/available`     | Taken: admin, root, angular, nerd, test, signal, user |
| `PUT /api/profile`                       | Auto-save target, echoes `savedAt`                    |
| `GET /api/products`, `/api/products/:id` | 24 products with color + emoji (no images)            |
| `GET /api/status/:code`                  | Simulated error responses                             |
| `GET /api/ticker`                        | Price snapshot                                        |

The **Network** button in the toolbar sets latency (0–3000 ms), an error rate (simulated 503) and
offline mode. Cancelled requests (unsubscribed / aborted) clear their timer and appear as
“cancelled” in the request log used by videos 012, 020 and 026. Seed data is generated with a fixed
PRNG seed, so tests are deterministic.

## Experimental & preview APIs

The status chip on every page shows the stability of the APIs the video is about:

- **Developer Preview:** `withViewTransitions()` / `ViewTransitionInfo` (014)
- **Experimental:** `debounced()` (019), `resourceFromSnapshots()` (026)

Details and every difference between the video scripts and the installed API are in
[`docs/API-NOTES.md`](docs/API-NOTES.md).

## Budgets

| Budget            | Warning                     | Error  |
| ----------------- | --------------------------- | ------ |
| initial           | **650 kB** (prompt: 500 kB) | 800 kB |
| anyComponentStyle | 6 kB                        | 10 kB  |

The initial bundle is about 586 kB raw / ~149 kB transferred. The app's own code in `main` is
~50 kB; the rest is framework code. With esbuild, a module that is used by `main` _and_ by lazy
chunks lives in a shared chunk that `main` preloads – so as soon as the demos use `resource`,
`httpResource`, pipes or the CDK scrolling module, those parts of `@angular/core`, `@angular/common`
and `@angular/cdk` move into the initial bundle. To stay small anyway, the shell lazy-loads the
network panel, the snackbar/overlay and uses a CSS progress bar instead of `MatProgressBar`.
The warning budget was therefore raised to 650 kB; the 800 kB error budget is unchanged.

## Deferred chunks (video 016)

Each `@defer` block produces its own lazy chunk (names are content hashes):

| Component                           | Trigger                      | Size (raw) |
| ----------------------------------- | ---------------------------- | ---------- |
| `HeavyChart`                        | `on viewport`                | ~1.3 kB    |
| `RichTextEditor`                    | `on interaction`             | ~2.1 kB    |
| `HelpContent`                       | `on hover; prefetch on idle` | ~1.0 kB    |
| `ReportPanel`                       | `when showReport()`          | ~1.3 kB    |
| `heavy-module.ts` (023, `import()`) | button click                 | ~0.2 kB    |
| GUI Expert Table (009, `@defer`)    | 4th table mode               | ~151 kB    |

Check the Network tab of your browser while triggering the blocks.

## Additional dependencies

- `@fontsource/roboto`, `material-symbols` – fonts are self-hosted (no request to Google Fonts,
  GDPR-friendly, and the production build doesn't need network access for font inlining).
- `@guiexpert/angular-table`, `@guiexpert/table` (MIT) – optional 4th mode in video 009; it supports
  Angular 22 (`peerDependencies ^22.0.1`) and runs zoneless without workarounds. Loaded via `@defer`.
  Full disclosure: GUI Expert is the author's project.
- `source-map-explorer` – for `npm run analyze:sme`.

## Testing

`ng test` runs Vitest through the Angular `unit-test` builder in Node with jsdom – no Karma, no
browser. Tests never use `fakeAsync`/`tick`; they rely on `await fixture.whenStable()`,
`vi.useFakeTimers()` / `vi.advanceTimersByTimeAsync()`, `HttpTestingController`, the in-memory
backend (0 ms latency, deterministic random) and the bindings API (`inputBinding`,
`outputBinding`, `twoWayBinding`). Video 005 and 021 show their real spec files in the UI.

`@testing-library/angular` (19.5, peer `@angular/core >= 21`) would be compatible, but it isn't
needed: plain `TestBed` plus the bindings API covers every case, and video 021 is about exactly
that API – so the project avoids the extra dependency. Vitest Browser Mode (Playwright) is not
configured; `ng test` runs headless in jsdom.
