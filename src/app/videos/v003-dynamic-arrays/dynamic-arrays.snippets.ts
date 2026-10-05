import { fromSources, snippet } from '../../shared/code-viewer/code-snippet';
import { BeforeAfterPair } from '../../shared/demo-page/demo-page';
import { SOURCES } from './sources.generated';

export const SNIPPETS = fromSources(SOURCES, [
  ['address-book.ts', 'Model, applyEach() schema and immutable array helpers.'],
  'dynamic-arrays.page.ts',
  ['dynamic-arrays.page.html', '@for over the array field – each row binds with [formField].'],
]);

export const BEFORE_AFTER: BeforeAfterPair = {
  before: snippet(
    'addresses.form-array.ts',
    `
form = this.fb.group({
  owner: ['', Validators.required],
  addresses: this.fb.array<FormGroup>([]),
});

get addresses(): FormArray {
  return this.form.get('addresses') as FormArray;
}

addressGroup(a?: Address): FormGroup {
  return this.fb.group({
    street: [a?.street ?? '', Validators.required],
    zip: [a?.zip ?? '', [Validators.required, Validators.pattern(/^\\d{4,5}$/)]],
    city: [a?.city ?? '', Validators.required],
    country: [a?.country ?? 'Germany'],
  });
}

add() { this.addresses.push(this.addressGroup()); }
remove(i: number) { this.addresses.removeAt(i); }
duplicate(i: number) {
  this.addresses.insert(i + 1, this.addressGroup((this.addresses.at(i) as FormGroup).value));
}
// <div formArrayName="addresses">
//   <div *ngFor="let g of addresses.controls; let i = index" [formGroupName]="i"> …
`,
    'FormArray: casts, factory functions per row, formArrayName/formGroupName in the template.',
  ),
  after: snippet(
    'addresses.signal-forms.ts',
    `
model = signal<AddressBook>({ owner: '', addresses: [] });
book = form(this.model, (path) => {
  required(path.owner);
  applyEach(path.addresses, (a) => {
    required(a.street);
    pattern(a.zip, /^\\d{4,5}$/);
    required(a.city);
  });
});

add() {
  this.model.update((b) => ({ ...b, addresses: [...b.addresses, emptyAddress()] }));
}
// @for (address of book.addresses; track address) {
//   <input [formField]="address.street" /> …
// }
`,
    'The array is just data in a signal – update it immutably, validate with applyEach().',
  ),
};
