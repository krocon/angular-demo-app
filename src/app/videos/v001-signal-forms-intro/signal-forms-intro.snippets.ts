import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['signal-forms-intro.page.ts', 'Model signal, form() with schema, computed flags.'],
  ['signal-forms-intro.page.html', '[formField] binds value and state; errors are signals.'],
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'registration.reactive.ts',
    `
@Component({ /* … */ })
export class RegistrationComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(18)]),
    newsletter: new FormControl(false),
  });
  value: unknown;
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe((v) => (this.value = v));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get ageErrors() {
    return this.form.get('age')?.errors;
  }
}
// <input formControlName="age" />
// <div *ngIf="form.get('age')?.hasError('min')">You must be at least 18.</div>
`,
    'Reactive Forms: FormGroup, Validators and a manual valueChanges subscription.',
  ),
  after: snippet(
    'registration.signal-forms.ts',
    `
export class RegistrationComponent {
  readonly model = signal({ name: '', email: '', age: null as number | null, newsletter: false });

  readonly registration = form(this.model, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    min(path.age, 18, { message: 'You must be at least 18.' });
  });
}
// <input [formField]="registration.age" />
// @if (registration.age().errors()[0]; as e) { {{ e.message }} }
`,
    'Signal Forms: the model is a signal, the state is a signal – nothing to unsubscribe.',
  ),
};
