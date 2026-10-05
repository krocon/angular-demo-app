import {
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { ensureStylesheet } from '../../shared/utils/stylesheet';
import { BEFORE_AFTER, SNIPPETS } from './look-and-feel.snippets';
import { FONTS, INSPECTED_TOKENS, PRESETS, cornerTokens, onColor } from './theme-tokens';

/** Video 010 – Look & feel: design tokens as CSS custom properties, scoped to a preview. */
@Component({
  selector: 'app-look-and-feel-page',
  imports: [
    DemoPage,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTabsModule,
  ],
  templateUrl: './look-and-feel.page.html',
  styleUrl: './look-and-feel.page.scss',
})
export class LookAndFeelPage {
  readonly #snackBar = inject(MatSnackBar);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly presets = PRESETS;
  readonly fonts = FONTS;

  readonly primary = signal<string>(PRESETS[0]);
  readonly radius = signal(12);
  readonly density = signal(0);
  readonly fontIndex = signal(0);
  readonly scheme = signal<'light' | 'dark'>('light');
  readonly brandButtons = signal(false);

  /** Only the preview container gets these properties – nothing global is overwritten. */
  readonly previewStyle = computed<Record<string, string>>(() => {
    const primary = this.primary();
    return {
      'color-scheme': this.scheme(),
      '--mat-sys-primary': primary,
      '--mat-sys-on-primary': onColor(primary),
      '--mat-sys-primary-container': `color-mix(in srgb, ${primary} 22%, var(--mat-sys-surface))`,
      '--mat-sys-on-primary-container': `color-mix(in srgb, ${primary} 70%, var(--mat-sys-on-surface))`,
      ...cornerTokens(this.radius()),
    };
  });

  readonly previewClass = computed(() =>
    [
      'preview',
      this.density() < 0 ? `density-${this.density()}` : '',
      this.fonts[this.fontIndex()]?.className ?? '',
      this.brandButtons() ? 'brand-buttons' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  readonly preview = viewChild.required<ElementRef<HTMLElement>>('preview');
  readonly tokenValues = signal<readonly { name: string; value: string }[]>([]);

  constructor() {
    // Density + font classes live in a CSS bundle that only this page loads.
    ensureStylesheet(inject(DOCUMENT), 'theme-playground-css', 'theme-playground.css');
    // Read the *computed* token values from the DOM after each render that changed them.
    afterRenderEffect({
      read: () => {
        this.previewStyle();
        this.previewClass();
        const style = getComputedStyle(this.preview().nativeElement);
        this.tokenValues.set(
          INSPECTED_TOKENS.map((name) => ({ name, value: style.getPropertyValue(name).trim() })),
        );
      },
    });
  }

  isColor(value: string): boolean {
    return value.startsWith('#') || value.startsWith('rgb') || value.startsWith('color');
  }

  openSnackbar(): void {
    this.#snackBar.open('Snackbars live in an overlay – they use the global theme.', 'OK', {
      duration: 3000,
    });
  }
}
