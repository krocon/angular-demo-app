import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CodeViewer } from '../../shared/code-viewer/code-viewer';

interface Question {
  readonly text: string;
  readonly yes: string;
  readonly no: string;
}

interface Answer {
  readonly pattern: string;
  readonly why: string;
  readonly code: string;
}

export const QUESTIONS: Readonly<Record<string, Question>> = {
  start: { text: 'Is the value derived from other signals?', yes: 'override', no: 'async' },
  override: {
    text: 'Must the user be able to override it locally?',
    yes: '=linkedSignal',
    no: '=computed',
  },
  async: { text: 'Does it come from an async source (HTTP, stream)?', yes: 'http', no: 'effect' },
  http: { text: 'Is it a simple HTTP GET?', yes: '=httpResource', no: 'observable' },
  observable: { text: 'Is the source an Observable?', yes: '=rxResource', no: '=resource' },
  effect: {
    text: 'Is it a side effect (storage, logging, a non-Angular API)?',
    yes: '=effect',
    no: 'delay',
  },
  delay: { text: 'Should updates be delayed or rate-limited?', yes: '=debounced', no: '=signal' },
};

export const ANSWERS: Readonly<Record<string, Answer>> = {
  computed: {
    pattern: 'computed()',
    why: 'Pure, read-only derivation.',
    code: 'total = computed(() => price() * qty());',
  },
  linkedSignal: {
    pattern: 'linkedSignal()',
    why: 'Derived, but writable – resets when the source changes.',
    code: 'selected = linkedSignal(() => options()[0]);\nselected.set(other);',
  },
  httpResource: {
    pattern: 'httpResource()',
    why: 'Shortest way to GET JSON as a resource.',
    code: 'user = httpResource<User>(() => `/api/users/${id()}`);',
  },
  rxResource: {
    pattern: 'rxResource()',
    why: 'Wraps an Observable; unsubscribes on param change.',
    code: 'data = rxResource({ params: () => id(), stream: ({ params }) => api.load(params) });',
  },
  resource: {
    pattern: 'resource()',
    why: 'Promise-based loader (or `stream`) with an AbortSignal.',
    code: 'data = resource({ params: () => id(), loader: ({ params, abortSignal }) => fetchIt(params, abortSignal) });',
  },
  effect: {
    pattern: 'effect()',
    why: 'Only for side effects – never to derive state.',
    code: "effect(() => localStorage.setItem('mode', mode()));",
  },
  debounced: {
    pattern: 'debounced() / throttleTime',
    why: 'debounced() (experimental) for "wait until quiet"; RxJS throttleTime for rate limits.',
    code: 'query = debounced(() => input(), 300);\n// or: toSignal(toObservable(input).pipe(throttleTime(300)))',
  },
  signal: { pattern: 'signal()', why: 'Plain local state.', code: 'count = signal(0);' },
};

/** "Which pattern do I need?" – a small question tree. */
@Component({
  selector: 'app-pattern-advisor',
  imports: [CodeViewer, MatButtonModule],
  template: `
    <ol class="trail">
      @for (step of trail(); track $index) {
        <li>{{ step }}</li>
      }
    </ol>
    @if (question(); as q) {
      <p class="question" aria-live="polite">{{ q.text }}</p>
      <div class="demo-row">
        <button mat-flat-button type="button" (click)="answer(true)">Yes</button>
        <button mat-stroked-button type="button" (click)="answer(false)">No</button>
      </div>
    } @else if (result(); as r) {
      <p class="question" aria-live="polite">
        Use <strong>{{ r.pattern }}</strong> – {{ r.why }}
      </p>
      <app-code-viewer file="recommendation.ts" [code]="r.code" />
    }
    <button mat-button type="button" (click)="restart()">Start over</button>
  `,
  styles: `
    .trail {
      margin: 0;
      padding-inline-start: 18px;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
    .question {
      font: var(--mat-sys-title-medium);
    }
  `,
})
export class PatternAdvisor {
  readonly node = signal('start');
  readonly trail = signal<readonly string[]>([]);
  readonly question = computed(() => QUESTIONS[this.node()]);
  readonly result = computed(() => ANSWERS[this.node().replace(/^=/, '')]);

  answer(yes: boolean): void {
    const q = this.question();
    if (!q) return;
    this.trail.update((t) => [...t, `${q.text} → ${yes ? 'yes' : 'no'}`]);
    this.node.set(yes ? q.yes : q.no);
  }

  restart(): void {
    this.node.set('start');
    this.trail.set([]);
  }
}
