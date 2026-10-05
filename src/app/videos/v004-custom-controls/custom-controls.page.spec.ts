import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { provideRouter } from '@angular/router';
import { CustomControlsPage } from './custom-controls.page';
import { StarRating } from './star-rating';
import { TagInput } from './tag-input';

describe('StarRating as FormValueControl (004)', () => {
  it('sets the value on click and with the keyboard', async () => {
    const value = signal(0);
    const fixture = TestBed.createComponent(StarRating, {
      bindings: [twoWayBinding('value', value)],
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('radiogroup');
    el.querySelectorAll('button')[2]!.click();
    expect(value()).toBe(3);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(value()).toBe(4);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(value()).toBe(5);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(value()).toBe(5);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(value()).toBe(1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(value()).toBe(1);
    await fixture.whenStable();
    expect(el.querySelector('[aria-checked=true]')?.getAttribute('aria-label')).toBe('1 star');
  });

  it('ignores input while disabled', async () => {
    const value = signal(2);
    const fixture = TestBed.createComponent(StarRating, {
      bindings: [twoWayBinding('value', value), inputBinding('disabled', () => true)],
    });
    await fixture.whenStable();
    fixture.componentInstance.select(5);
    (fixture.nativeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End' }),
    );
    expect(value()).toBe(2);
  });
});

describe('TagInput (004)', () => {
  it('adds unique lowercase tags and removes them', async () => {
    const value = signal<string[]>([]);
    const fixture = TestBed.createComponent(TagInput, {
      bindings: [twoWayBinding('value', value)],
    });
    await fixture.whenStable();
    const clear = vi.fn();
    const event = (v: string) =>
      ({ value: v, chipInput: { clear } }) as unknown as MatChipInputEvent;
    fixture.componentInstance.add(event(' Signals '));
    fixture.componentInstance.add(event('signals'));
    fixture.componentInstance.add(event(''));
    expect(value()).toEqual(['signals']);
    expect(clear).toHaveBeenCalledTimes(3);
    fixture.componentInstance.remove('signals');
    expect(value()).toEqual([]);
  });
});

describe('CustomControlsPage (004)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('binds both custom controls with [formField]', async () => {
    const fixture = TestBed.createComponent(CustomControlsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    el.querySelectorAll<HTMLButtonElement>('app-star-rating button')[3]!.click();
    expect(page.model().rating).toBe(4);
    expect(page.review.rating().dirty()).toBe(true);
    page.review.rating().value.set(2);
    await fixture.whenStable();
    expect(
      el.querySelector('app-star-rating [aria-checked=true]')?.getAttribute('aria-label'),
    ).toBe('2 stars');
    expect(el.querySelectorAll('mat-chip-row')).toHaveLength(1);
  });

  it('validates rating min 1 and tags maxLength 5', async () => {
    const fixture = TestBed.createComponent(CustomControlsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    expect(page.review.rating().errors()[0]?.message).toBe('Please pick 1 to 5 stars.');
    page.model.update((m) => ({ ...m, tags: ['a', 'b', 'c', 'd', 'e', 'f'] }));
    expect(page.review.tags().errors()[0]?.message).toBe('At most 5 tags.');
    page.submit();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-star-rating [role=alert]')
        ?.textContent,
    ).toContain('1 to 5');
  });

  it('passes disabled from the schema into the custom control', async () => {
    const fixture = TestBed.createComponent(CustomControlsPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.ratingLocked.set(true);
    await fixture.whenStable();
    expect(page.ratingState().disabled).toBe(true);
    expect(page.ratingState().reasons).toEqual(['Rating is locked']);
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'app-star-rating button',
    );
    expect([...buttons].every((b) => b.disabled)).toBe(true);
  });
});
