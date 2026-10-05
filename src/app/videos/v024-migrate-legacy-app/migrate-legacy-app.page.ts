import { Component, computed, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CodeViewer } from '../../shared/code-viewer/code-viewer';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { SNIPPETS } from './migrate-legacy-app.snippets';
import { CHECKLIST, MIGRATIONS, VERSIONS, upgradeSteps } from './upgrade-plan';

export const PLAN_STORAGE_KEY = 'ng22-demos.upgrade-plan';

interface StoredPlan {
  from: number;
  material: boolean;
  done: string[];
}

function readPlan(): StoredPlan {
  try {
    const raw = globalThis.localStorage?.getItem(PLAN_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredPlan;
  } catch {
    // ignore broken or unavailable storage
  }
  return { from: 16, material: true, done: [] };
}

/** Video 024 – Migrating a legacy app to Angular 22: small steps instead of a big bang. */
@Component({
  selector: 'app-migrate-legacy-app-page',
  imports: [
    CodeViewer,
    DemoPage,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatSelectModule,
    MatStepperModule,
  ],
  templateUrl: './migrate-legacy-app.page.html',
  styleUrl: './migrate-legacy-app.page.scss',
})
export class MigrateLegacyAppPage {
  readonly snippets = SNIPPETS;
  readonly versions = VERSIONS;
  readonly migrations = MIGRATIONS;
  readonly checklist = CHECKLIST;

  readonly #initial = readPlan();
  readonly from = signal(this.#initial.from);
  readonly withMaterial = signal(this.#initial.material);
  readonly done = signal<ReadonlySet<string>>(new Set(this.#initial.done));

  readonly steps = computed(() => upgradeSteps(this.from(), this.withMaterial()));
  readonly allIds = computed(() => [
    ...this.steps().map((s) => s.id),
    ...this.migrations.flatMap((m) => this.checklist.map((c) => `${m.id}:${c}`)),
  ]);
  readonly progress = computed(() => {
    const ids = this.allIds();
    const done = ids.filter((id) => this.done().has(id)).length;
    return {
      done,
      total: ids.length,
      percent: ids.length ? Math.round((done / ids.length) * 100) : 0,
    };
  });

  constructor() {
    effect(() => {
      const plan: StoredPlan = {
        from: this.from(),
        material: this.withMaterial(),
        done: [...this.done()],
      };
      try {
        globalThis.localStorage?.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
      } catch {
        // storage unavailable – progress stays in memory
      }
    });
  }

  isDone(id: string): boolean {
    return this.done().has(id);
  }

  toggle(id: string, checked: boolean): void {
    this.done.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  reset(): void {
    this.done.set(new Set());
  }
}
