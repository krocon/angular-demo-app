import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['resource-composition.page.ts', 'chain() in the params context + resourceFromSnapshots().'],
  ['keep-previous.ts', 'linkedSignal on the snapshot: loading → reloading with the old value.'],
  'resource-composition.page.html',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'user-company.rxjs.ts',
    `
userLoading = false;
companyLoading = false;
error?: string;
company?: Company;

this.userId$.pipe(
  tap(() => { this.userLoading = true; this.error = undefined; }),
  switchMap((id) => this.http.get<User>(\`/api/users/\${id}\`).pipe(
    catchError((e) => { this.error = e.message; return EMPTY; }),
    finalize(() => (this.userLoading = false)),
  )),
  tap(() => (this.companyLoading = true)),
  switchMap((user) => this.http.get<Company>(\`/api/companies/\${user.companyId}\`).pipe(
    catchError((e) => { this.error = e.message; return EMPTY; }),
    finalize(() => (this.companyLoading = false)),
  )),
  takeUntilDestroyed(),
).subscribe((company) => (this.company = company));
`,
    'Nested switchMap with hand-written loading and error state per step.',
  ),
  after: snippet(
    'user-company.resources.ts',
    `
readonly user = httpResource<User>(() => \`/api/users/\${this.userId()}\`);

readonly company = httpResource<Company>(({ chain }) =>
  \`/api/companies/\${chain(this.user).companyId}\`,
);
// company.status() is 'loading' while the user loads and 'error' if it fails.
`,
    'chain(): status propagation for free.',
  ),
};
