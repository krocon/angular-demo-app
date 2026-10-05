import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTestApp } from '../testing/test-app.providers';
import { App } from './app';
import { SearchStore } from './core/search/search.store';
import { ThemeStore } from './core/theme/theme.store';

describe('App shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestApp() });
  });

  async function setup() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('lists all 27 videos grouped by category in the sidenav', async () => {
    const { el } = await setup();
    expect(el.querySelectorAll('.nav-link')).toHaveLength(27);
    expect(el.querySelectorAll('.nav-group')).toHaveLength(6);
  });

  it('filters the navigation with the global search', async () => {
    const { fixture, el } = await setup();
    const input = el.querySelector<HTMLInputElement>('input[type=search]')!;
    input.value = 'resource';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const titles = [...el.querySelectorAll('.nav-link .title')].map((n) => n.textContent);
    expect(titles).toContain('Data Fetching with resource() & rxResource()');
    expect(titles).toContain('Resource Composition (chain & Snapshots)');
    expect(titles.length).toBeLessThan(27);

    TestBed.inject(SearchStore).query.set('zzz-nothing');
    await fixture.whenStable();
    expect(el.querySelector('.no-results')?.textContent).toContain('zzz-nothing');
  });

  it('cycles the theme and writes color-scheme onto <html>', async () => {
    const { fixture, el } = await setup();
    const theme = TestBed.inject(ThemeStore);
    theme.mode.set('light');
    await fixture.whenStable();
    expect(document.documentElement.style.colorScheme).toBe('light');
    el.querySelector<HTMLButtonElement>('button[aria-label^="Theme"]')!.click();
    await fixture.whenStable();
    expect(theme.mode()).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    theme.mode.set('system');
    await fixture.whenStable();
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it('navigates to the previous/next video with Alt+Arrow keys', async () => {
    const { fixture } = await setup();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/videos/002-validation');
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/videos/003-dynamic-arrays');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/videos/002-validation');
  });

  it('does not navigate with Alt+Arrow outside of a video page', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance.navigateRelative(1)).toBe(false);
  });

  it('focuses the search field when "/" is pressed', async () => {
    const { el } = await setup();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
    expect(document.activeElement).toBe(el.querySelector('input[type=search]'));
  });

  it('navigates to the first search hit on Enter', async () => {
    const { fixture, el } = await setup();
    TestBed.inject(SearchStore).query.set('zoneless');
    await fixture.whenStable();
    el.querySelector('input[type=search]')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/videos/011-zoneless');
  });
});
