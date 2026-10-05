import { applyEach, maxLength, pattern, required, schema } from '@angular/forms/signals';

export interface Address {
  street: string;
  zip: string;
  city: string;
  country: string;
}

export interface AddressBook {
  owner: string;
  addresses: Address[];
}

export const COUNTRIES = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Denmark'] as const;

export const emptyAddress = (): Address => ({ street: '', zip: '', city: '', country: 'Germany' });

/** applyEach() runs the item schema for every row – however many there are. */
export const addressBookSchema = schema<AddressBook>((path) => {
  required(path.owner, { message: 'Owner is required.' });
  maxLength(path.addresses, 6, { message: 'At most 6 addresses.' });
  applyEach(path.addresses, (address) => {
    required(address.street, { message: 'Street is required.' });
    required(address.zip, { message: 'ZIP is required.' });
    pattern(address.zip, /^\d{4,5}$/, { message: '4–5 digits.' });
    required(address.city, { message: 'City is required.' });
  });
});

// Immutable array helpers – the model is a plain array, so plain functions do the job.
export const insertAt = <T>(list: readonly T[], index: number, item: T): T[] => [
  ...list.slice(0, index),
  item,
  ...list.slice(index),
];

export const removeAt = <T>(list: readonly T[], index: number): T[] =>
  list.filter((_, i) => i !== index);

export function move<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) {
    return [...list];
  }
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item as T);
  return copy;
}
