import { Service, computed, signal } from '@angular/core';
import { VIDEO_CATALOG } from '../catalog/video-catalog';
import { VideoEntry } from '../catalog/video.model';

export function matchesQuery(video: VideoEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = [video.num, video.title, video.category, video.summary, ...video.tags]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => haystack.includes(part));
}

/** Global video search (toolbar, sidenav and home page share one query signal). */
@Service()
export class SearchStore {
  readonly query = signal('');
  readonly results = computed(() =>
    (VIDEO_CATALOG as readonly VideoEntry[]).filter((v) => matchesQuery(v, this.query())),
  );
}
