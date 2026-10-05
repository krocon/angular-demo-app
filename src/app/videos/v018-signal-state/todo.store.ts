import { Service, computed, signal } from '@angular/core';

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export type TodoFilter = 'all' | 'active' | 'done';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

const INITIAL: TodoState = {
  todos: [
    { id: 1, title: 'Watch video 018', done: true },
    { id: 2, title: 'Write a signal store', done: false },
  ],
  filter: 'all',
};

/** One private signal, a few computed selectors and methods – that's the store. */
@Service()
export class TodoStore {
  readonly #state = signal<TodoState>(INITIAL);
  #nextId = 3;

  // Read-only outside: selectors
  readonly state = this.#state.asReadonly();
  readonly todos = computed(() => this.#state().todos);
  readonly filter = computed(() => this.#state().filter);
  readonly remaining = computed(() => this.todos().filter((t) => !t.done).length);
  readonly visible = computed(() => {
    const { todos, filter } = this.#state();
    return filter === 'all' ? todos : todos.filter((t) => t.done === (filter === 'done'));
  });

  // Updates as methods
  add(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    const todo: Todo = { id: this.#nextId++, title: trimmed, done: false };
    this.#state.update((s) => ({ ...s, todos: [...s.todos, todo] }));
  }

  toggle(id: number): void {
    this.#state.update((s) => ({
      ...s,
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }

  remove(id: number): void {
    this.#state.update((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) }));
  }

  clearCompleted(): void {
    this.#state.update((s) => ({ ...s, todos: s.todos.filter((t) => !t.done) }));
  }

  setFilter(filter: TodoFilter): void {
    this.#state.update((s) => ({ ...s, filter }));
  }

  reset(): void {
    this.#state.set(INITIAL);
  }
}
