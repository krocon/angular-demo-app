import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserBadge } from './user-badge';

describe('UserBadge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('loads the user via httpResource (HttpTestingController)', async () => {
    const userId = signal(7);
    const fixture = TestBed.createComponent(UserBadge, {
      bindings: [inputBinding('userId', userId)],
    });
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/users/7')
      .flush({ id: 7, name: 'Grace Hopper', email: 'g@h.io', role: 'x', companyId: 1 });
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid=name]')?.textContent,
    ).toBe('Grace Hopper');
  });

  it('re-fetches when the input signal changes and shows errors', async () => {
    const userId = signal(1);
    const fixture = TestBed.createComponent(UserBadge, {
      bindings: [inputBinding('userId', userId)],
    });
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/users/1')
      .flush({ id: 1, name: 'Ada', email: 'a@b.c', role: 'x', companyId: 1 });
    userId.set(2);
    fixture.detectChanges();
    http.expectOne('/api/users/2').flush(null, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid=state]')?.textContent,
    ).toContain('Could not load user 2');
  });
});
