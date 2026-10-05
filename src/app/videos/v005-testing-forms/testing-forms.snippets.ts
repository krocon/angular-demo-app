import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['login-form.spec.ts', 'The real spec file – it runs in `ng test` and in CI.'],
  ['test-scenarios.ts', 'Shared scenarios: the spec and this page execute the same functions.'],
  ['login-form.ts', 'The system under test.'],
  [
    'angular.json (test target)',
    'The unit-test builder uses Vitest by default (jsdom, no browser).',
  ],
  ['package.json (scripts)', 'CI runs `npm test` → `ng test --no-watch`.'],
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'login.component.karma.spec.ts',
    `
describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
    }).compileComponents();
  });

  it('enables submit when valid', fakeAsync(() => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.controls.email.setValue('ada@example.com');
    form.controls.password.setValue('correct horse');
    tick(300); // wait for valueChanges + debounceTime
    fixture.detectChanges();
    expect(form.valid).toBeTrue();
  }));
});
// karma.conf.js + Chrome required to run …
`,
    'Karma + Jasmine: zone.js, fakeAsync/tick and a real Chrome.',
  ),
  after: snippet(
    'login-form.spec.ts',
    `
it('valid input → submit enabled', () => {
  const model = signal({ email: '', password: '', rememberMe: false });
  const f = form(model, loginSchema, { injector: TestBed.inject(Injector) });

  model.set({ email: 'ada@example.com', password: 'correct horse', rememberMe: false });

  expect(f().valid()).toBe(true);
});
// ng test --no-watch  → Vitest in Node (jsdom)
`,
    'Vitest: set the model, read the state – synchronous, no zone.js.',
  ),
};
