import { reflectComponentType } from '@angular/core';
import { VIDEO_CATALOG, findVideo, videoIndex } from './video-catalog';
import { VIDEO_CATEGORIES, VideoEntry, videoLink, videoPath } from './video.model';

const catalog: readonly VideoEntry[] = VIDEO_CATALOG;

describe('VIDEO_CATALOG', () => {
  it('contains exactly 27 videos numbered 001–027 in order', () => {
    expect(catalog).toHaveLength(27);
    expect(catalog.map((v) => v.num)).toEqual(
      Array.from({ length: 27 }, (_, i) => String(i + 1).padStart(3, '0')),
    );
  });

  it('has unique numbers and slugs', () => {
    expect(new Set(catalog.map((v) => v.num)).size).toBe(27);
    expect(new Set(catalog.map((v) => v.slug)).size).toBe(27);
  });

  it('assigns the categories from the series plan', () => {
    const byCategory = Object.fromEntries(
      VIDEO_CATEGORIES.map((c) => [c, catalog.filter((v) => v.category === c).map((v) => v.num)]),
    );
    expect(byCategory).toEqual({
      'Signal Forms': ['001', '002', '003', '004', '005', '006', '007', '008'],
      'Data & UI': ['009', '010', '013', '014'],
      'Reactivity & Signals': ['011', '012', '017', '018', '019', '026'],
      'Templates & Performance': ['015', '016', '023'],
      'Architecture & HTTP': ['020', '022', '027'],
      'Testing & Tooling': ['021', '024', '025'],
    });
  });

  it('has 3–5 key points, a takeaway and tags for every video', () => {
    for (const video of catalog) {
      expect(video.keyPoints.length, video.num).toBeGreaterThanOrEqual(3);
      expect(video.keyPoints.length, video.num).toBeLessThanOrEqual(5);
      expect(video.takeaway.length, video.num).toBeGreaterThan(5);
      expect(video.tags.length, video.num).toBeGreaterThan(0);
    }
  });

  it.each(catalog.map((v) => [v.num, v] as const))(
    'video %s lazily loads a component',
    async (_, video) => {
      const component = await video.loadComponent();
      expect(reflectComponentType(component)).not.toBeNull();
      if (video.loadChildren) {
        const children = await video.loadChildren();
        expect(children.length).toBeGreaterThan(0);
      }
    },
  );

  it('builds paths and links', () => {
    expect(videoPath({ num: '001', slug: 'signal-forms-intro' })).toBe(
      'videos/001-signal-forms-intro',
    );
    expect(videoLink({ num: '012', slug: 'resource' })).toBe('/videos/012-resource');
  });

  it('finds videos by number', () => {
    expect(findVideo('012')?.slug).toBe('resource');
    expect(findVideo('999')).toBeUndefined();
    expect(videoIndex('001')).toBe(0);
  });
});
