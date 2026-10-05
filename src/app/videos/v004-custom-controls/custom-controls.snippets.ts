import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['star-rating.ts', 'FormValueControl<number>: value = model(), state arrives as inputs.'],
  ['tag-input.ts', 'FormValueControl<string[]> on top of mat-chip-grid.'],
  'custom-controls.page.ts',
  'custom-controls.page.html',
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'star-rating.cva.ts',
    `
@Component({
  selector: 'app-star-rating',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRatingComponent), multi: true },
  ],
  template: \`…\`,
})
export class StarRatingComponent implements ControlValueAccessor {
  value = 0;
  disabled = false;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: number): void {
    this.value = value ?? 0;
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  select(star: number) {
    this.value = star;
    this.onChange(star);
    this.onTouched();
  }
}
`,
    'ControlValueAccessor: provider, four callbacks and manual change detection.',
  ),
  after: snippet(
    'star-rating.signal-forms.ts',
    `
@Component({ selector: 'app-star-rating', template: \`…\` })
export class StarRating implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
  readonly touch = output<void>();

  select(star: number) {
    this.value.set(star);
  }
}
// <app-star-rating [formField]="review.rating" />
`,
    'FormValueControl: a model() plus optional state inputs – filled by [formField].',
  ),
};
