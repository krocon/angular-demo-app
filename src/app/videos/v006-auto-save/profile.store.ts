import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_ERROR_HANDLING } from '../../core/http/http-context';

export interface Profile {
  displayName: string;
  bio: string;
  language: string;
  notifications: boolean;
}

export interface SavedProfile extends Profile {
  savedAt: string;
}

/** Writes go through HttpClient – resources are for reading. */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  readonly #http = inject(HttpClient);

  save(profile: Profile): Observable<SavedProfile> {
    return this.#http.put<SavedProfile>('/api/profile', profile, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
    });
  }
}
