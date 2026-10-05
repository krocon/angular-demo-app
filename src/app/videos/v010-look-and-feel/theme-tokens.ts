/** Pure helpers for the theme playground. */

export const PRESETS = ['#005cbb', '#6750a4', '#006a6a', '#b3261e', '#7d5260', '#386a20'] as const;

/** Each font maps to a precompiled class that re-declares the typography tokens. */
export const FONTS = [
  { label: 'Roboto', className: '' },
  { label: 'System UI', className: 'font-system' },
  { label: 'Serif (Georgia)', className: 'font-serif' },
] as const;

export const INSPECTED_TOKENS = [
  '--mat-sys-primary',
  '--mat-sys-on-primary',
  '--mat-sys-primary-container',
  '--mat-sys-on-primary-container',
  '--mat-sys-surface',
  '--mat-sys-corner-small',
  '--mat-sys-corner-medium',
  '--mat-sys-corner-large',
  '--mat-sys-body-large-font',
] as const;

/** Relative luminance (WCAG) of a #rrggbb color. */
export function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white – whichever has the better contrast on the given color. */
export function onColor(hex: string): string {
  return luminance(hex) > 0.179 ? '#000000' : '#ffffff';
}

/** Corner tokens scaled from one "radius" control (Material uses 4/8/12/16/28 px by default). */
export function cornerTokens(radius: number): Record<string, string> {
  const scale = radius / 12;
  return {
    '--mat-sys-corner-extra-small': `${Math.round(4 * scale)}px`,
    '--mat-sys-corner-small': `${Math.round(8 * scale)}px`,
    '--mat-sys-corner-medium': `${Math.round(12 * scale)}px`,
    '--mat-sys-corner-large': `${Math.round(16 * scale)}px`,
    '--mat-sys-corner-extra-large': `${Math.round(28 * scale)}px`,
  };
}
