import { Route, Routes } from '@angular/router';
import { VIDEO_CATALOG } from './core/catalog/video-catalog';
import { VideoEntry, videoPath } from './core/catalog/video.model';

/** One lazy route per video, generated from the catalog, plus a short redirect `/videos/001`. */
export function videoRoutes(catalog: readonly VideoEntry[]): Routes {
  return catalog.flatMap((video): Route[] => {
    const base = { path: videoPath(video), title: video.title, data: { video } };
    return [
      { path: `videos/${video.num}`, redirectTo: videoPath(video), pathMatch: 'full' },
      video.loadChildren
        ? { ...base, loadChildren: video.loadChildren }
        : { ...base, loadComponent: video.loadComponent },
    ];
  });
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Overview',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  ...videoRoutes(VIDEO_CATALOG),
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
