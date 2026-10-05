import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { snippet } from '../code-viewer/code-snippet';
import { BeforeAfterPair, DemoPage } from './demo-page';

@Component({
  selector: 'app-host',
  imports: [DemoPage],
  template: `<app-demo-page [num]="num()" [snippets]="snippets" [beforeAfter]="pair()">
    <p class="projected">live!</p>
  </app-demo-page>`,
})
class Host {
  readonly num = signal('002');
  readonly snippets = [snippet('a.ts', 'const a = 1;')];
  readonly pair = signal<BeforeAfterPair | null>({
    before: snippet('old.ts', 'a\nb'),
    after: snippet('new.ts', 'a'),
  });
}

describe('DemoPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'demo', component: Host }])],
    });
  });

  async function open(url = '/demo') {
    const harness = await RouterTestingHarness.create();
    const host = await harness.navigateByUrl(url, Host);
    return { harness, host, el: harness.routeNativeElement as HTMLElement };
  }

  it('renders header, key points, projected demo, takeaway and pager', async () => {
    const { el } = await open();
    expect(el.querySelector('h1')?.textContent).toBe('Validation Patterns');
    expect(el.querySelector('.eyebrow')?.textContent).toContain('Video 002');
    expect(el.querySelectorAll('.key-points li')).toHaveLength(5);
    expect(el.querySelector('.projected')?.textContent).toBe('live!');
    expect(el.querySelector('.takeaway')?.textContent).toContain('Rules in the schema');
    expect(el.querySelector('.prev')?.getAttribute('href')).toBe('/videos/001-signal-forms-intro');
    expect(el.querySelector('.next')?.getAttribute('href')).toBe('/videos/003-dynamic-arrays');
    expect(el.querySelectorAll('[role=tab]')).toHaveLength(3);
  });

  it('selects the tab from ?tab= and writes it back', async () => {
    const { harness, el } = await open('/demo?tab=code');
    await harness.fixture.whenStable();
    expect(el.querySelector('[role=tab][aria-selected=true]')?.textContent).toContain('Code');
    expect(el.querySelector('app-code-viewer')).not.toBeNull();
    const page = harness.fixture.debugElement.query(By.directive(DemoPage))
      .componentInstance as DemoPage;
    page.selectTab(2);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/demo?tab=before-after');
    page.selectTab(0);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/demo');
  });

  it('hides the Before/After tab when there is no pair and has no prev link for 001', async () => {
    const { harness, host, el } = await open();
    host.pair.set(null);
    host.num.set('001');
    await harness.fixture.whenStable();
    expect(el.querySelectorAll('[role=tab]')).toHaveLength(2);
    expect(el.querySelector('.prev')).toBeNull();
  });

  it('throws for unknown video numbers', async () => {
    const { harness, host } = await open();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    host.num.set('999');
    await expect(harness.fixture.whenStable()).rejects.toThrow(/Unknown video 999/);
    consoleError.mockRestore();
  });
});
