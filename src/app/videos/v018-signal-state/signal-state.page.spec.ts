import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SignalStatePage } from './signal-state.page';
import { IsolatedTodoWidget, TodoWidget } from './todo-widget';
import { TodoStore } from './todo.store';

describe('TodoStore (018)', () => {
  let store: TodoStore;
  beforeEach(() => (store = TestBed.inject(TodoStore)));

  it('starts with two todos and one remaining', () => {
    expect(store.todos()).toHaveLength(2);
    expect(store.remaining()).toBe(1);
    expect(store.filter()).toBe('all');
  });

  it('adds trimmed todos and ignores empty titles', () => {
    store.add('  New  ');
    store.add('   ');
    expect(store.todos().at(-1)).toEqual({ id: 3, title: 'New', done: false });
    expect(store.todos()).toHaveLength(3);
  });

  it('toggles, removes and clears completed immutably', () => {
    const before = store.todos();
    store.toggle(2);
    expect(store.todos()).not.toBe(before);
    expect(store.remaining()).toBe(0);
    store.toggle(2);
    store.remove(1);
    expect(store.todos().map((t) => t.id)).toEqual([2]);
    store.toggle(2);
    store.clearCompleted();
    expect(store.todos()).toEqual([]);
  });

  it('filters via computed selectors', () => {
    store.setFilter('done');
    expect(store.visible().map((t) => t.id)).toEqual([1]);
    store.setFilter('active');
    expect(store.visible().map((t) => t.id)).toEqual([2]);
    store.reset();
    expect(store.state().filter).toBe('all');
  });

  it('exposes state read-only', () => {
    expect(Object.keys(store.state)).not.toContain('set');
    expect(typeof (store.state as unknown as { set?: unknown }).set).toBe('undefined');
  });
});

describe('SignalStatePage (018)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('shares the root store but isolates the feature widget', async () => {
    const fixture = TestBed.createComponent(SignalStatePage);
    await fixture.whenStable();
    const widgets = fixture.debugElement.queryAll(By.directive(TodoWidget));
    expect(widgets).toHaveLength(3);
    const [a, b, c] = widgets.map((w) => (w.componentInstance as TodoWidget).store);
    expect(a).toBe(b);
    expect(a).toBe(fixture.componentInstance.store);
    expect(c).not.toBe(a);
    a!.add('shared');
    expect(b!.todos()).toHaveLength(3);
    expect(c!.todos()).toHaveLength(2);
    expect(fixture.debugElement.query(By.directive(IsolatedTodoWidget))).toBeTruthy();
  });

  it('ignores unknown filter values', async () => {
    const fixture = TestBed.createComponent(SignalStatePage);
    await fixture.whenStable();
    fixture.componentInstance.setFilter('done');
    expect(fixture.componentInstance.store.filter()).toBe('done');
    fixture.componentInstance.setFilter(undefined);
    expect(fixture.componentInstance.store.filter()).toBe('done');
  });
});
