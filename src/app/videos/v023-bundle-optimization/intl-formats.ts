/** Native Intl instead of a date/number library – zero bytes added to the bundle. */
export interface IntlSample {
  readonly api: string;
  readonly output: string;
}

export const LOCALES = ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'] as const;

export function intlSamples(locale: string, now: Date): IntlSample[] {
  const list = ['Signals', 'Resources', 'Forms'];
  const plural = new Intl.PluralRules(locale);
  return [
    {
      api: 'Intl.DateTimeFormat',
      output: new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(
        now,
      ),
    },
    {
      api: 'Intl.RelativeTimeFormat',
      output: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-3, 'day'),
    },
    {
      api: 'Intl.NumberFormat (currency)',
      output: new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(
        1234567.891,
      ),
    },
    {
      api: 'Intl.NumberFormat (compact)',
      output: new Intl.NumberFormat(locale, { notation: 'compact' }).format(2_500_000),
    },
    {
      api: 'Intl.ListFormat',
      output: new Intl.ListFormat(locale, { type: 'conjunction' }).format(list),
    },
    {
      api: 'Intl.PluralRules',
      output: [0, 1, 2, 5].map((n) => `${n} → ${plural.select(n)}`).join(', '),
    },
  ];
}

/** Approximate minified + gzipped sizes – always check bundlephobia.com for current numbers. */
export const LIBRARY_SIZES = [
  {
    library: 'moment (+ locales)',
    approx: '~70 kB gz',
    native: 'Intl.DateTimeFormat / RelativeTimeFormat',
  },
  { library: 'numeral.js', approx: '~4 kB gz', native: 'Intl.NumberFormat' },
  {
    library: 'lodash (full import)',
    approx: '~25 kB gz',
    native: 'Array/Object methods, structuredClone',
  },
  { library: 'pluralize', approx: '~2 kB gz', native: 'Intl.PluralRules' },
] as const;
