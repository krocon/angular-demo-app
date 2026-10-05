/**
 * A deliberately "heavy" module, loaded with import() on demand.
 * import.meta.url tells us which chunk the bundler put it into.
 */
export const CHUNK_URL = import.meta.url;

export function primesUpTo(limit: number): number[] {
  const sieve = new Uint8Array(limit + 1);
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (!sieve[i]) {
      primes.push(i);
      for (let j = i * i; j <= limit; j += i) sieve[j] = 1;
    }
  }
  return primes;
}

export const ELEMENTS = [
  'Hydrogen',
  'Helium',
  'Lithium',
  'Beryllium',
  'Boron',
  'Carbon',
  'Nitrogen',
  'Oxygen',
  'Fluorine',
  'Neon',
  'Sodium',
  'Magnesium',
  'Aluminium',
  'Silicon',
  'Phosphorus',
  'Sulfur',
  'Chlorine',
  'Argon',
  'Potassium',
  'Calcium',
  'Scandium',
  'Titanium',
  'Vanadium',
  'Chromium',
  'Manganese',
  'Iron',
  'Cobalt',
  'Nickel',
  'Copper',
  'Zinc',
] as const;
