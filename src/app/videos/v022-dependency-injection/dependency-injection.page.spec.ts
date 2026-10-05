import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withAutoCleanupInjectors } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppConfigStore } from '../../core/config/app-config.store';
import { routes } from './dependency-injection.routes';
import { LifecycleLogStore } from './lifecycle-log.store';

describe('DependencyInjectionPage (022)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'videos/022-dependency-injection', children: routes }],
          withAutoCleanupInjectors(),
        ),
        provideHttpClient(),
      ],
    });
  });

  const messages = () =>
    TestBed.inject(LifecycleLogStore)
      .entries()
      .map((e) => e.message)
      .reverse();

  it('creates a route-scoped service per feature and destroys it when the route is left', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/videos/022-dependency-injection/feature-a');
    expect((harness.fixture.nativeElement as HTMLElement).textContent).toContain('Feature A');
    await harness.navigateByUrl('/videos/022-dependency-injection/feature-b');
    const log = messages();
    expect(log[0]).toBe('environment initializer: injector for Feature A created');
    expect(log[1]).toMatch(/FeatureSessionService #\d+ created for Feature A/);
    expect(log).toContainEqual(expect.stringMatching(/destroyed \(Feature A\) – timer cleared/));
    expect(log).toContainEqual(expect.stringMatching(/created for Feature B/));
  });

  it('blocks feature B when the flag is off (functional guard)', async () => {
    TestBed.inject(AppConfigStore).setFeature('featureB', false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/videos/022-dependency-injection/feature-b');
    expect(TestBed.inject(Router).url).toBe('/videos/022-dependency-injection');
    expect(messages().at(-1)).toBe('guard: "featureB" is disabled – navigation blocked');
  });

  it('counts uptime with a timer that is cleared on destroy', async () => {
    vi.useFakeTimers();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/videos/022-dependency-injection/feature-a');
    await vi.advanceTimersByTimeAsync(3000);
    harness.fixture.detectChanges();
    expect((harness.fixture.nativeElement as HTMLElement).textContent).toContain('3 s');
    vi.useRealTimers();
  });
});
