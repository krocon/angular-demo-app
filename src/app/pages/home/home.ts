import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { VIDEO_CATALOG } from '../../core/catalog/video-catalog';
import { VIDEO_CATEGORIES, VideoCategory, videoLink } from '../../core/catalog/video.model';
import { SearchStore } from '../../core/search/search.store';
import { ApiStatusChip } from '../../shared/api-status-chip/api-status-chip';

/** Overview of all videos with category filter and search. */
@Component({
  selector: 'app-home',
  imports: [
    ApiStatusChip,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly search = inject(SearchStore);
  readonly categories = VIDEO_CATEGORIES;
  readonly total = VIDEO_CATALOG.length;
  readonly category = signal<VideoCategory | null>(null);
  readonly link = videoLink;

  readonly videos = computed(() => {
    const category = this.category();
    return this.search.results().filter((v) => !category || v.category === category);
  });

  selectCategory(value: unknown): void {
    this.category.set(
      (VIDEO_CATEGORIES as readonly unknown[]).includes(value) ? (value as VideoCategory) : null,
    );
  }

  resetFilters(): void {
    this.category.set(null);
    this.search.query.set('');
  }
}
