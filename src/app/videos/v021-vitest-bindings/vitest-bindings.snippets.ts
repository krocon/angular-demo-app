import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  [
    'quantity-stepper.spec.ts',
    'inputBinding, outputBinding, twoWayBinding in TestBed.createComponent.',
  ],
  ['user-badge.spec.ts', 'httpResource + HttpTestingController + await fixture.whenStable().'],
  'quantity-stepper.ts',
  'user-badge.ts',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'quantity-stepper.host.spec.ts',
    `
@Component({
  template: \`<app-quantity-stepper [max]="max" [(value)]="value" (limitReached)="limit = $event" />\`,
  imports: [QuantityStepper],
})
class TestHost {
  max = 2;
  value = 0;
  limit?: Limit;
}

it('emits limitReached', () => {
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  const stepper = fixture.debugElement.query(By.directive(QuantityStepper)).componentInstance;
  stepper.increment();
  stepper.increment();
  fixture.detectChanges();
  expect(fixture.componentInstance.limit).toBe('max');
  fixture.componentRef.setInput('max', 5); // only works on the host …
});
`,
    'A test host component just to wire inputs and outputs.',
  ),
  after: snippet(
    'quantity-stepper.spec.ts',
    `
it('emits limitReached', async () => {
  const spy = vi.fn();
  const fixture = TestBed.createComponent(QuantityStepper, {
    bindings: [inputBinding('max', () => 2), outputBinding('limitReached', spy)],
  });
  await fixture.whenStable();
  fixture.componentInstance.increment();
  fixture.componentInstance.increment();
  expect(spy).toHaveBeenCalledExactlyOnceWith('max');
});
`,
    'Bindings API: no host component, signals in, spies out.',
  ),
};
