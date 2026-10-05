import { inputBinding, outputBinding, signal, twoWayBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Limit, QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  it('binds an input to a signal with inputBinding', async () => {
    const max = signal(3);
    const fixture = TestBed.createComponent(QuantityStepper, {
      bindings: [inputBinding('max', max), inputBinding('min', () => 1)],
    });
    await fixture.whenStable();
    expect(fixture.componentInstance.max()).toBe(3);
    max.set(5); // no setInput(), no detectChanges() – just set the signal
    await fixture.whenStable();
    expect(fixture.componentInstance.max()).toBe(5);
  });

  it('catches an output with outputBinding and a vi.fn() spy', async () => {
    const spy = vi.fn<(limit: Limit) => void>();
    const fixture = TestBed.createComponent(QuantityStepper, {
      bindings: [inputBinding('max', () => 2), outputBinding<Limit>('limitReached', spy)],
    });
    await fixture.whenStable();
    fixture.componentInstance.increment();
    fixture.componentInstance.increment();
    expect(spy).toHaveBeenCalledExactlyOnceWith('max');
  });

  it('syncs a model() both ways with twoWayBinding', async () => {
    const value = signal(4);
    const fixture = TestBed.createComponent(QuantityStepper, {
      bindings: [twoWayBinding('value', value), inputBinding('step', () => 2)],
    });
    await fixture.whenStable();
    const output = (fixture.nativeElement as HTMLElement).querySelector('[data-testid=value]')!;
    expect(output.textContent).toBe('4');
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label=Increase]')!
      .click();
    expect(value()).toBe(6); // component → test signal
    value.set(0); // test signal → component
    await fixture.whenStable();
    expect(output.textContent).toBe('0');
  });
});
