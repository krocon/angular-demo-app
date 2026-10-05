/** Tip 1: type the model with an interface – optional fields stay optional. */
export interface Customer {
  name: string;
  email: string;
  company?: string;
  vatId?: string;
}

/** What the backend expects: derived from the form model, not hand-written. */
export type CustomerPayload = Omit<Customer, 'vatId'> & { vatId: string | null };

export function toPayload(customer: Customer): CustomerPayload {
  return { ...customer, vatId: customer.vatId?.trim() || null };
}

export interface Checkout {
  billingName: string;
  differentShipping: boolean;
  shipping: { street: string; city: string; country: string };
  express: boolean;
}

export interface Signup {
  username: string;
}

export interface Contact {
  name: string;
  email: string;
  message: string;
}

export interface Newsletter {
  email: string;
}
