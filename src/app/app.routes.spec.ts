import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTestApp } from '../testing/test-app.providers';
import { routes, videoRoutes } from './app.routes';
import { VIDEO_CATALOG } from './core/catalog/video-catalog';
import { VideoEntry, videoLink } from './core/catalog/video.model';

const catalog: readonly VideoEntry[] = VIDEO_CATALOG;

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestApp() });
  });

  it('generates a lazy route and a short redirect per video', () => {
    const generated = videoRoutes(catalog);
    expect(generated).toHaveLength(54);
    expect(generated.filter((r) => r.redirectTo)).toHaveLength(27);
    expect(routes.at(-1)?.path).toBe('**');
  });

  it.each(catalog.map((v) => [v.num, v] as const))(
    'renders video %s with its title',
    async (_, video) => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(videoLink(video));
      const h1 = harness.routeNativeElement?.querySelector('h1');
      expect(h1?.textContent?.trim()).toBe(video.title);
      expect(TestBed.inject(Title).getTitle()).toBe(`${video.title} · Angular 22 Demos`);
    },
  );

  it('redirects /videos/001 to the full URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/videos/001');
    expect(TestBed.inject(Router).url).toBe('/videos/001-signal-forms-intro');
  });

  it('shows the not-found page for unknown URLs', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/does/not/exist');
    expect(harness.routeNativeElement?.textContent).toContain('Page not found');
    expect(TestBed.inject(Title).getTitle()).toBe('Page not found · Angular 22 Demos');
  });

  it('renders the home page with all videos', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement?.querySelectorAll('mat-card')).toHaveLength(27);
  });
});
