import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LookAndFeelPage } from './look-and-feel.page';
import { cornerTokens, luminance, onColor } from './theme-tokens';

describe('theme token helpers (010)', () => {
  it('picks a readable on-color', () => {
    expect(onColor('#005cbb')).toBe('#ffffff');
    expect(onColor('#ffeb3b')).toBe('#000000');
    expect(luminance('#ffffff')).toBeCloseTo(1);
    expect(luminance('#000000')).toBe(0);
  });

  it('scales the corner tokens from one radius', () => {
    expect(cornerTokens(12)['--mat-sys-corner-medium']).toBe('12px');
    expect(cornerTokens(24)['--mat-sys-corner-extra-large']).toBe('56px');
    expect(cornerTokens(0)['--mat-sys-corner-small']).toBe('0px');
  });
});

describe('LookAndFeelPage (010)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('scopes tokens to the preview container and switches classes', async () => {
    const fixture = TestBed.createComponent(LookAndFeelPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.primary.set('#b3261e');
    page.radius.set(20);
    page.density.set(-2);
    page.fontIndex.set(2);
    page.brandButtons.set(true);
    await fixture.whenStable();
    const preview = page.preview().nativeElement;
    expect(preview.style.getPropertyValue('--mat-sys-primary')).toBe('#b3261e');
    expect(preview.style.getPropertyValue('--mat-sys-corner-medium')).toBe('20px');
    expect(preview.className).toContain('density--2');
    expect(preview.className).toContain('font-serif');
    expect(preview.className).toContain('brand-buttons');
    expect(document.documentElement.style.getPropertyValue('--mat-sys-primary')).toBe('');
    expect(page.tokenValues().find((t) => t.name === '--mat-sys-primary')?.value).toBe('#b3261e');
    expect(document.getElementById('theme-playground-css')).not.toBeNull();
    expect(page.isColor('#fff')).toBe(true);
    expect(page.isColor('12px')).toBe(false);
  });
});
