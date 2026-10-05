import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import {
  AddressBook,
  COUNTRIES,
  addressBookSchema,
  emptyAddress,
  insertAt,
  move,
  removeAt,
} from './address-book';
import { BEFORE_AFTER, SNIPPETS } from './dynamic-arrays.snippets';

/** Video 003 – Dynamic forms with arrays: the array lives in the model signal. */
@Component({
  selector: 'app-dynamic-arrays-page',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    DemoPage,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    StateInspector,
  ],
  templateUrl: './dynamic-arrays.page.html',
  styleUrl: './dynamic-arrays.page.scss',
})
export class DynamicArraysPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly countries = COUNTRIES;

  readonly model = signal<AddressBook>({
    owner: 'Ada Lovelace',
    addresses: [
      { street: 'Signal Street 1', zip: '10115', city: 'Berlin', country: 'Germany' },
      { street: '', zip: '12', city: 'Vienna', country: 'Austria' },
    ],
  });
  readonly book = form(this.model, addressBookSchema);

  readonly rows = computed(() => this.model().addresses.length);
  readonly invalidRows = computed(
    () => [...this.book.addresses].filter((address) => address().invalid()).length,
  );

  #updateAddresses(fn: (list: AddressBook['addresses']) => AddressBook['addresses']): void {
    this.model.update((book) => ({ ...book, addresses: fn(book.addresses) }));
  }

  add(): void {
    this.#updateAddresses((list) => [...list, emptyAddress()]);
  }

  duplicate(index: number): void {
    this.#updateAddresses((list) => insertAt(list, index + 1, { ...list[index]! }));
  }

  remove(index: number): void {
    this.#updateAddresses((list) => removeAt(list, index));
  }

  moveBy(index: number, delta: number): void {
    this.#updateAddresses((list) => move(list, index, index + delta));
  }

  drop(event: CdkDragDrop<unknown>): void {
    this.#updateAddresses((list) => move(list, event.previousIndex, event.currentIndex));
  }

  showErrors(): void {
    this.book().markAsTouched();
  }
}
