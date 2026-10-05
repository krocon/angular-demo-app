import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['validation.rules.ts', 'All five patterns live in one schema – no subscriptions anywhere.'],
  'validation.page.ts',
  'validation.page.html',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'username-available.validator.ts',
    `
@Injectable({ providedIn: 'root' })
export class UsernameAvailableValidator implements AsyncValidator {
  private http = inject(HttpClient);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return timer(400).pipe(
      switchMap(() =>
        this.http.get<{ available: boolean }>(
          \`/api/usernames/\${control.value}/available\`,
        ),
      ),
      map((res) => (res.available ? null : { taken: true })),
      catchError(() => of({ unreachable: true })),
      first(),
    );
  }
}

// usage
handle = new FormControl('', {
  validators: [Validators.required, Validators.minLength(3)],
  asyncValidators: [inject(UsernameAvailableValidator).validate.bind(...)],
  updateOn: 'change',
});
`,
    'Class-based AsyncValidator: timer + switchMap for debounce, manual error mapping.',
  ),
  after: snippet(
    'schema.ts',
    `
required(path.handle);
minLength(path.handle, 3);
validateHttp(path.handle, {
  request: ({ value }) => \`/api/usernames/\${value()}/available\`,
  debounce: 400,
  onSuccess: (res: { available: boolean }) =>
    res.available ? null : { kind: 'taken', message: 'Already taken.' },
  onError: () => ({ kind: 'unreachable', message: 'Could not check.' }),
});
`,
    'validateHttp: debounce, cancellation and pending state are built in.',
  ),
};
