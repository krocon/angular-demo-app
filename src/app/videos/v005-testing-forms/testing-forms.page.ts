import { Component, Injector, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { EventLog, EventLogBuffer } from '../../shared/event-log/event-log';
import { Login, LoginForm } from './login-form';
import { SCENARIOS, Scenario, ScenarioResult, runScenario } from './test-scenarios';
import { BEFORE_AFTER, SNIPPETS } from './testing-forms.snippets';

/** Video 005 – Testing Signal Forms with Vitest: the spec's scenarios, runnable in the browser. */
@Component({
  selector: 'app-testing-forms-page',
  imports: [DemoPage, EventLog, LoginForm, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './testing-forms.page.html',
  styleUrl: './testing-forms.page.scss',
})
export class TestingFormsPage {
  readonly #injector = inject(Injector);
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;
  readonly scenarios = SCENARIOS;
  readonly log = new EventLogBuffer();

  readonly results = signal<Readonly<Record<string, ScenarioResult>>>({});
  readonly passed = computed(() => Object.values(this.results()).filter((r) => r.passed).length);
  readonly ran = computed(() => Object.keys(this.results()).length);

  run(scenario: Scenario): void {
    const result = runScenario(scenario, this.#injector);
    this.results.update((all) => ({ ...all, [scenario.name]: result }));
  }

  runAll(): void {
    this.results.set({});
    this.scenarios.forEach((s) => this.run(s));
  }

  onLogin(login: Login): void {
    this.log.log(`submitted ${login.email} (rememberMe: ${login.rememberMe})`);
  }

  format(value: unknown): string {
    return JSON.stringify(value);
  }
}
