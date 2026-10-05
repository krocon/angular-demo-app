import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TodoStore } from './todo.store';

/** Compact widget – which store instance it gets depends on where it is provided. */
@Component({
  selector: 'app-todo-widget',
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule],
  template: `
    <h4>{{ title() }}</h4>
    <p class="demo-hint">{{ store.remaining() }} open · {{ store.todos().length }} total</p>
    <ul>
      @for (todo of store.todos(); track todo.id) {
        <li>
          <mat-checkbox [checked]="todo.done" (change)="store.toggle(todo.id)">{{
            todo.title
          }}</mat-checkbox>
        </li>
      }
    </ul>
    <form class="add" (submit)="$event.preventDefault(); store.add(input.value); input.value = ''">
      <input #input type="text" [attr.aria-label]="'New todo for ' + title()" placeholder="Add…" />
      <button mat-icon-button type="submit" [attr.aria-label]="'Add todo to ' + title()">
        <mat-icon>add</mat-icon>
      </button>
    </form>
  `,
  styles: `
    :host {
      display: block;
      padding: 12px;
      border-radius: var(--mat-sys-corner-medium);
      border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
    }
    h4 {
      margin: 0;
      font: var(--mat-sys-title-small);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .add {
      display: flex;
      align-items: center;
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid var(--mat-sys-outline);
      border-radius: var(--mat-sys-corner-small);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class TodoWidget {
  readonly store = inject(TodoStore);
  readonly title = input('Widget');
}

/** Same widget, but with its own store instance: feature state via component providers. */
@Component({
  selector: 'app-isolated-todo-widget',
  imports: [TodoWidget],
  providers: [TodoStore],
  template: `<app-todo-widget [title]="title()" />`,
})
export class IsolatedTodoWidget {
  readonly title = input('Isolated widget');
}
