import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['auto-save.page.ts', 'toObservable(model) + debounceTime → PUT, then reset().'],
  ['unsaved-changes.guard.ts', 'Functional canDeactivate guard that reads the dirty signal.'],
  'auto-save.routes.ts',
  'profile.store.ts',
  'auto-save.page.html',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'profile.component.ts',
    `
export class ProfileComponent implements OnInit {
  form = this.fb.group({ displayName: [''], bio: [''] });
  isDirty = false; // manual flag

  constructor(private fb: FormBuilder, private api: ProfileApi) {}

  ngOnInit() {
    // ⚠️ never unsubscribed → leaks after navigation
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.isDirty = true;
      this.api.save(value).subscribe(() => {
        this.isDirty = false;
        this.form.markAsPristine();
      });
    });
  }

  canDeactivate(): boolean {
    return !this.isDirty || confirm('Discard changes?');
  }
}
`,
    'valueChanges.subscribe without cleanup, a manual dirty flag and window.confirm().',
  ),
  after: snippet(
    'profile.signal-forms.ts',
    `
readonly model = signal<Profile>(initial);
readonly profile = form(this.model, profileSchema);
readonly hasUnsavedChanges = computed(() => this.profile().dirty());

constructor() {
  toObservable(this.model).pipe(
    skip(1),
    debounceTime(500),
    filter(() => this.profile().dirty() && this.profile().valid()),
    switchMap((value) => this.api.save(value)),
    tap(() => this.profile().reset()),
    takeUntilDestroyed(),
  ).subscribe();
}
`,
    'dirty is a signal, cleanup is automatic, reset() makes the form pristine again.',
  ),
};
