export const TARGET_VERSION = 22;
export const VERSIONS = Array.from({ length: 10 }, (_, i) => 12 + i); // 12 … 21

export interface UpgradeStep {
  readonly id: string;
  readonly version: number;
  readonly command: string;
  readonly note?: string;
}

const NOTES: Readonly<Record<number, string>> = {
  14: 'Typed forms arrive – existing forms are migrated to UntypedFormGroup.',
  15: 'Standalone APIs are stable; MDC-based Material components.',
  17: 'New control flow (@if/@for) and @defer; application builder (esbuild).',
  18: 'Zoneless (experimental), signal inputs/queries mature.',
  19: 'Standalone by default (standalone: true no longer needed).',
  20: 'Signals APIs stable, new style guide file names.',
  21: 'Zoneless and Vitest become the defaults.',
  22: 'Signal Forms stable, OnPush by default.',
};

/** One `ng update` per major – never jump several versions at once. */
export function upgradeSteps(from: number, withMaterial: boolean): UpgradeStep[] {
  const steps: UpgradeStep[] = [];
  for (let v = from + 1; v <= TARGET_VERSION; v++) {
    const packages = [`@angular/core@${v}`, `@angular/cli@${v}`];
    if (withMaterial) packages.push(`@angular/material@${v}`, `@angular/cdk@${v}`);
    steps.push({
      id: `v${v}`,
      version: v,
      command: `ng update ${packages.join(' ')}`,
      note: NOTES[v],
    });
  }
  return steps;
}

export interface MigrationStep {
  readonly id: string;
  readonly title: string;
  readonly command: string;
  readonly before: string;
  readonly after: string;
}

/** Schematic names verified against `@angular/core/schematics/collection.json` (v22.2). */
export const MIGRATIONS: readonly MigrationStep[] = [
  {
    id: 'standalone',
    title: 'Standalone components',
    command: 'ng generate @angular/core:standalone-migration',
    before:
      '@NgModule({ declarations: [UserCard], imports: [CommonModule] })\nexport class UserModule {}',
    after:
      "@Component({ selector: 'app-user-card', imports: [DatePipe] })\nexport class UserCard {}",
  },
  {
    id: 'control-flow',
    title: 'Control flow',
    command: 'ng generate @angular/core:control-flow-migration',
    before: '<li *ngFor="let u of users; trackBy: byId">{{ u.name }}</li>',
    after: '@for (u of users; track u.id) { <li>{{ u.name }}</li> }',
  },
  {
    id: 'inject',
    title: 'inject()',
    command: 'ng generate @angular/core:inject-migration',
    before: 'constructor(private http: HttpClient) {}',
    after: 'private readonly http = inject(HttpClient);',
  },
  {
    id: 'signal-input',
    title: 'Signal inputs',
    command: 'ng generate @angular/core:signal-input-migration',
    before: '@Input({ required: true }) name!: string;',
    after: 'readonly name = input.required<string>();',
  },
  {
    id: 'output',
    title: 'Outputs',
    command: 'ng generate @angular/core:output-migration',
    before: '@Output() selected = new EventEmitter<string>();',
    after: 'readonly selected = output<string>();',
  },
  {
    id: 'signal-queries',
    title: 'Signal queries',
    command: 'ng generate @angular/core:signal-queries-migration',
    before: "@ViewChild('input') input?: ElementRef;",
    after: "readonly input = viewChild<ElementRef>('input');",
  },
  {
    id: 'cleanup',
    title: 'Cleanup unused imports',
    command: 'ng generate @angular/core:cleanup-unused-imports',
    before: 'imports: [NgIf, NgFor, DatePipe] // NgIf/NgFor no longer used',
    after: 'imports: [DatePipe]',
  },
];

export const CHECKLIST = ['Build', 'Test', 'Commit'] as const;
