export interface Order {
  product: string;
  pricing: {
    quantity: number;
    unitPrice: number;
    discount: number; // percent
  };
}

export const PRODUCTS = ['Signal Lamp', 'Zone Breaker', 'Deferred Rocket'] as const;

export const INITIAL_ORDER: Order = {
  product: 'Signal Lamp',
  pricing: { quantity: 2, unitPrice: 49.9, discount: 10 },
};

export function orderTotal(quantity: number, unitPrice: number, discount: number): number {
  return Math.round(quantity * unitPrice * (1 - discount / 100) * 100) / 100;
}
