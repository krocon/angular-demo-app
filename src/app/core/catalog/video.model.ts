import { Type } from '@angular/core';
import { Routes } from '@angular/router';

export const VIDEO_CATEGORIES = [
  'Signal Forms',
  'Data & UI',
  'Reactivity & Signals',
  'Templates & Performance',
  'Architecture & HTTP',
  'Testing & Tooling',
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export type ApiStatus = 'stable' | 'developer-preview' | 'experimental';

export interface VideoEntry {
  /** Three-digit video number, e.g. `'001'`. */
  readonly num: string;
  /** URL slug, e.g. `'signal-forms-intro'`. */
  readonly slug: string;
  readonly title: string;
  readonly category: VideoCategory;
  readonly summary: string;
  readonly keyPoints: readonly string[];
  /** The "Remember: …" sentence from the script. */
  readonly takeaway: string;
  readonly apiStatus: ApiStatus;
  readonly tags: readonly string[];
  /** Lazy page component (always present – used by the catalog tests and simple routes). */
  readonly loadComponent: () => Promise<Type<unknown>>;
  /** Optional lazy child routes for pages that need guards, providers or child routes. */
  readonly loadChildren?: () => Promise<Routes>;
}

/** Full route path of a video page, e.g. `videos/001-signal-forms-intro`. */
export function videoPath(video: Pick<VideoEntry, 'num' | 'slug'>): string {
  return `videos/${video.num}-${video.slug}`;
}

/** Absolute router link of a video page. */
export function videoLink(video: Pick<VideoEntry, 'num' | 'slug'>): string {
  return `/${videoPath(video)}`;
}
