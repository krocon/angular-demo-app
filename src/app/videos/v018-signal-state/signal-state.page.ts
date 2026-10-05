import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import { SNIPPETS } from './signal-state.snippets';
import { IsolatedTodoWidget, TodoWidget } from './todo-widget';
import { TodoFilter, TodoStore } from './todo.store';

/** Video 018 – Lightweight state management with a signal store. */
@Component({
  selector: 'app-signal-state-page',
  imports: [
    DemoPage,
    IsolatedTodoWidget,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    StateInspector,
    TodoWidget,
  ],
  templateUrl: './signal-state.page.html',
  styleUrl: './signal-state.page.scss',
})
export class SignalStatePage {
  readonly store = inject(TodoStore);
  readonly snippets = SNIPPETS;
  readonly filters: readonly TodoFilter[] = ['all', 'active', 'done'];

  setFilter(value: unknown): void {
    if (this.filters.includes(value as TodoFilter)) {
      this.store.setFilter(value as TodoFilter);
    }
  }
}
