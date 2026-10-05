import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RULES, analyze, modernityScore } from './ai-code-analyzer';
import { EXAMPLES } from './ai-examples';
import { ReviewAiCodePage } from './review-ai-code.page';

const rulesIn = (code: string) => analyze(code).map((f) => f.rule);

describe('AI code analyzer (025)', () => {
  const cases: [rule: string, bad: string, good: string][] = [
    ['ng-module', '@NgModule({ declarations: [] })', '@Component({ imports: [] })'],
    ['structural-directive', '<li *ngFor="let x of xs">', '@for (x of xs; track x.id) {'],
    ['decorator-io', '@Input() name: string;', 'readonly name = input<string>();'],
    ['decorator-query', "@ViewChild('x') x?: ElementRef;", "readonly x = viewChild('x');"],
    ['host-decorator', "@HostListener('click')", "host: { '(click)': 'onClick()' }"],
    [
      'constructor-injection',
      'constructor(private http: HttpClient) {}',
      'private readonly http = inject(HttpClient);',
    ],
    ['behavior-subject', 'items$ = new BehaviorSubject([]);', 'items = signal<Item[]>([]);'],
    [
      'subscribe-without-cleanup',
      'this.api.load().subscribe((x) => (this.x = x));',
      'this.api.load().pipe(takeUntilDestroyed()).subscribe();',
    ],
    ['for-without-track', '@for (item of items) {', '@for (item of items; track item.id) {'],
    ['ng-class-style', '<div [ngClass]="{ a: b }">', '<div [class.a]="b">'],
    ['any-type', 'users: any[] = [];', 'users: User[] = [];'],
    ['standalone-true', 'standalone: true,', 'imports: [],'],
    [
      'common-module',
      "import { CommonModule } from '@angular/common';",
      "import { DatePipe } from '@angular/common';",
    ],
  ];

  it('covers every rule with a positive and a negative case', () => {
    expect(cases.map((c) => c[0]).sort()).toEqual(RULES.map((r) => r.id).sort());
  });

  it.each(cases)('%s', (rule, bad, good) => {
    expect(rulesIn(bad)).toContain(rule);
    expect(rulesIn(good)).not.toContain(rule);
  });

  it('accepts cleanup a few lines above the subscribe', () => {
    const code =
      'this.api\n  .load()\n  .pipe(takeUntilDestroyed(this.destroyRef))\n  .subscribe();';
    expect(rulesIn(code)).not.toContain('subscribe-without-cleanup');
  });

  it('reports line numbers and scores the examples', () => {
    const findings = analyze(EXAMPLES[0]!.code);
    expect(findings.find((f) => f.rule === 'constructor-injection')?.line).toBe(20);
    expect(modernityScore(findings)).toBe(0);
    expect(modernityScore(analyze(EXAMPLES[1]!.code))).toBeGreaterThan(0);
    expect(analyze(EXAMPLES[2]!.code)).toEqual([]);
    expect(modernityScore([])).toBe(10);
  });
});

describe('ReviewAiCodePage (025)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('analyzes the editor content live', async () => {
    const fixture = TestBed.createComponent(ReviewAiCodePage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.counts().high).toBeGreaterThan(3);
    page.load(2);
    await fixture.whenStable();
    expect(page.score()).toBe(10);
    expect((fixture.nativeElement as HTMLElement).querySelector('.clean')).not.toBeNull();
    expect(page.mcpConfig).toContain('"mcp"');
    page.load(99);
    expect(page.code()).toBe('');
  });
});
