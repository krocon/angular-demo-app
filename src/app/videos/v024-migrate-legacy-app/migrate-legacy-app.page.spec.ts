import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MigrateLegacyAppPage, PLAN_STORAGE_KEY } from './migrate-legacy-app.page';
import { MIGRATIONS, upgradeSteps } from './upgrade-plan';

describe('upgrade plan (024)', () => {
  it('creates one ng update per major version', () => {
    const steps = upgradeSteps(19, true);
    expect(steps.map((s) => s.version)).toEqual([20, 21, 22]);
    expect(steps[0]?.command).toBe(
      'ng update @angular/core@20 @angular/cli@20 @angular/material@20 @angular/cdk@20',
    );
    expect(upgradeSteps(21, false)[0]?.command).toBe('ng update @angular/core@22 @angular/cli@22');
  });

  it('uses schematic names that exist in @angular/core', () => {
    for (const m of MIGRATIONS) {
      expect(m.command).toMatch(/^ng generate @angular\/core:[a-z-]+$/);
    }
  });
});

describe('MigrateLegacyAppPage (024)', () => {
  beforeEach(() => {
    localStorage.removeItem(PLAN_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('tracks progress and persists it', async () => {
    const fixture = TestBed.createComponent(MigrateLegacyAppPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.steps()).toHaveLength(6);
    expect(page.progress().total).toBe(6 + MIGRATIONS.length * 3);
    page.toggle('v17', true);
    page.toggle('inject:Build', true);
    expect(page.progress().done).toBe(2);
    page.toggle('v17', false);
    expect(page.isDone('v17')).toBe(false);
    page.from.set(20);
    await fixture.whenStable();
    expect(JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) ?? '{}')).toMatchObject({
      from: 20,
      done: ['inject:Build'],
    });
    page.reset();
    expect(page.progress().done).toBe(0);
  });

  it('restores a saved plan', async () => {
    localStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({ from: 18, material: false, done: ['v19'] }),
    );
    const fixture = TestBed.createComponent(MigrateLegacyAppPage);
    await fixture.whenStable();
    expect(fixture.componentInstance.from()).toBe(18);
    expect(fixture.componentInstance.isDone('v19')).toBe(true);
  });
});
