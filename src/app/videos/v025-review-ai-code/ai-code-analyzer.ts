export type Severity = 'high' | 'medium' | 'low';

export interface Finding {
  readonly rule: string;
  readonly line: number;
  readonly severity: Severity;
  readonly message: string;
  readonly fix: string;
}

interface LineRule {
  readonly id: string;
  readonly severity: Severity;
  readonly test: (line: string, lines: readonly string[], index: number) => boolean;
  readonly message: string;
  readonly fix: string;
}

const hasCleanupNearby = (lines: readonly string[], index: number): boolean =>
  lines
    .slice(Math.max(0, index - 4), index + 1)
    .some((l) => /takeUntilDestroyed|takeUntil\(|DestroyRef|\bfirst\(\)|\btake\(1\)/.test(l));

/** Every rule is a small pure function – easy to test, easy to extend. */
export const RULES: readonly LineRule[] = [
  {
    id: 'ng-module',
    severity: 'high',
    test: (l) => /@NgModule\s*\(/.test(l),
    message: 'NgModule – standalone components are the default.',
    fix: "Remove the module; import dependencies in the component's `imports`.",
  },
  {
    id: 'structural-directive',
    severity: 'high',
    test: (l) => /\*ng(If|For|Switch)\b/.test(l),
    message: '*ngIf / *ngFor / *ngSwitch – legacy structural directives.',
    fix: 'Use @if, @for (with track) and @switch.',
  },
  {
    id: 'decorator-io',
    severity: 'high',
    test: (l) => /@(Input|Output)\s*\(/.test(l),
    message: '@Input / @Output decorators.',
    fix: 'Use input(), input.required(), output() or model().',
  },
  {
    id: 'decorator-query',
    severity: 'medium',
    test: (l) => /@(ViewChild|ViewChildren|ContentChild|ContentChildren)\s*\(/.test(l),
    message: 'Decorator-based queries.',
    fix: 'Use viewChild(), viewChildren(), contentChild(), contentChildren().',
  },
  {
    id: 'host-decorator',
    severity: 'medium',
    test: (l) => /@(HostBinding|HostListener)\s*\(/.test(l),
    message: '@HostBinding / @HostListener.',
    fix: 'Use the `host: {}` object in @Component / @Directive.',
  },
  {
    id: 'constructor-injection',
    severity: 'medium',
    test: (l) => /constructor\s*\(\s*(private|public|protected|readonly)\s/.test(l),
    message: 'Constructor injection.',
    fix: 'Use inject(): `private readonly http = inject(HttpClient);`',
  },
  {
    id: 'behavior-subject',
    severity: 'medium',
    test: (l) => /\bBehaviorSubject\b/.test(l),
    message: 'BehaviorSubject for component/service state.',
    fix: 'Use signal() + computed(); expose read-only with asReadonly().',
  },
  {
    id: 'subscribe-without-cleanup',
    severity: 'high',
    test: (l, lines, i) => /\.subscribe\(/.test(l) && !hasCleanupNearby(lines, i),
    message: '.subscribe() without cleanup – possible memory leak.',
    fix: 'Prefer resource()/toSignal(); otherwise pipe(takeUntilDestroyed()).',
  },
  {
    id: 'for-without-track',
    severity: 'high',
    test: (l) => /@for\s*\(/.test(l) && !/;\s*track\s/.test(l),
    message: '@for without track.',
    fix: 'Add `track item.id` (or `track $index` for static lists).',
  },
  {
    id: 'ng-class-style',
    severity: 'low',
    test: (l) => /\[ng(Class|Style)\]/.test(l),
    message: 'ngClass / ngStyle.',
    fix: 'Use [class.x] / [style.x] or [class] / [style] bindings.',
  },
  {
    id: 'any-type',
    severity: 'medium',
    test: (l) => /:\s*any\b|<any>|\bas any\b/.test(l),
    message: '`any` type – type safety is switched off.',
    fix: 'Use a proper type or `unknown`.',
  },
  {
    id: 'standalone-true',
    severity: 'low',
    test: (l) => /standalone:\s*true/.test(l),
    message: '`standalone: true` is the default since v19.',
    fix: 'Remove it.',
  },
  {
    id: 'common-module',
    severity: 'low',
    test: (l) => /\bCommonModule\b/.test(l),
    message: 'CommonModule import.',
    fix: 'Import only what you use (e.g. DatePipe) or nothing with control flow.',
  },
];

const WEIGHT: Record<Severity, number> = { high: 2, medium: 1, low: 0.5 };

export function analyze(code: string): Finding[] {
  const lines = code.split('\n');
  const findings: Finding[] = [];
  lines.forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.test(line, lines, index)) {
        findings.push({
          rule: rule.id,
          line: index + 1,
          severity: rule.severity,
          message: rule.message,
          fix: rule.fix,
        });
      }
    }
  });
  return findings;
}

/** 10 = modern Angular 22 code, 0 = time capsule. */
export function modernityScore(findings: readonly Finding[]): number {
  const penalty = findings.reduce((sum, f) => sum + WEIGHT[f.severity], 0);
  return Math.max(0, Math.round(10 - penalty));
}
