import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fakeBackendInterceptor } from '../../core/fake-backend/fake-backend.interceptor';
import { NetworkSettingsStore } from '../../core/fake-backend/network-settings.store';
import { TipsAndTricksPage } from './tips-and-tricks.page';
import { toPayload } from './tips.models';

describe('TipsAndTricksPage (007)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([fakeBackendInterceptor]))],
    });
    TestBed.inject(NetworkSettingsStore).latencyMs.set(0);
  });

  async function setup() {
    const fixture = TestBed.createComponent(TipsAndTricksPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  it('tip 1: derives the payload from the typed model', () => {
    expect(toPayload({ name: 'a', email: 'b', vatId: '  ' })).toEqual({
      name: 'a',
      email: 'b',
      vatId: null,
    });
    expect(toPayload({ name: 'a', email: 'b', vatId: 'DE1' }).vatId).toBe('DE1');
  });

  it('tip 2: hidden fields are not validated, readonly and disabled come from the schema', async () => {
    const { page } = await setup();
    expect(page.checkout.shipping().hidden()).toBe(true);
    expect(page.checkout().valid()).toBe(true);
    expect(page.checkout.express().disabled()).toBe(true);
    expect(page.checkout.shipping.country().readonly()).toBe(true);
    page.checkout.differentShipping().value.set(true);
    expect(page.checkout.shipping().hidden()).toBe(false);
    expect(page.checkout().valid()).toBe(false);
    expect(page.checkout.express().disabled()).toBe(false);
  });

  it('tip 4: submit() blocks invalid forms and marks everything touched', async () => {
    const { page } = await setup();
    await page.sendContact();
    expect(page.contact().touched()).toBe(true);
    expect(page.submitLog.entries().map((e) => e.message)).toEqual([
      'submit() resolved: false',
      'blocked – 2 error(s), all fields touched',
    ]);
    page.contactModel.set({ name: 'Ada', email: 'ada@example.com', message: 'Hello there!' });
    await page.sendContact();
    expect(page.submitLog.entries()[1]?.message).toContain('action() ran');
    expect(page.submitLog.entries()[0]?.message).toBe('submit() resolved: true');
  });

  it('tip 5: canSubmit is a computed UI flag', async () => {
    const { page } = await setup();
    expect(page.canSubmit()).toBe(false);
    page.newsletterModel.set({ email: 'ada@example.com' });
    expect(page.canSubmit()).toBe(true);
    vi.useFakeTimers();
    const saving = page.subscribe();
    expect(page.isSaving()).toBe(true);
    expect(page.canSubmit()).toBe(false);
    await vi.advanceTimersByTimeAsync(1200);
    await saving;
    expect(page.isSaving()).toBe(false);
    expect(page.newsletterModel().email).toBe('');
    vi.useRealTimers();
  });

  it('tip 3: required reacts instantly, HTTP only after the debounce', async () => {
    const { page } = await setup();
    page.signupModel.set({ username: '' });
    expect(page.signup.username().errors()[0]?.kind).toBe('required');
    page.signupModel.set({ username: 'admin' });
    TestBed.tick();
    expect(page.asyncChecks()).toBe(0);
    await vi.waitFor(() => expect(page.asyncChecks()).toBe(1), { timeout: 2000 });
    await vi.waitFor(() => expect(page.signup.username().errors()[0]?.kind).toBe('taken'), {
      timeout: 2000,
    });
  });
});
