import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SCENARIOS } from './test-scenarios';
import { TestingFormsPage } from './testing-forms.page';

describe('TestingFormsPage (005)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('runs all scenarios in the browser and they all pass', async () => {
    const fixture = TestBed.createComponent(TestingFormsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.runAll();
    expect(page.ran()).toBe(SCENARIOS.length);
    expect(page.passed()).toBe(SCENARIOS.length);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('li.pass')).toHaveLength(
      SCENARIOS.length,
    );
  });

  it('logs submitted logins', async () => {
    const fixture = TestBed.createComponent(TestingFormsPage);
    await fixture.whenStable();
    fixture.componentInstance.onLogin({ email: 'a@b.c', password: 'x', rememberMe: true });
    expect(fixture.componentInstance.log.entries()[0]?.message).toContain('a@b.c');
    expect(fixture.componentInstance.format({ a: 1 })).toBe('{"a":1}');
  });
});
