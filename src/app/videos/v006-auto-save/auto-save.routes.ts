import { Routes } from '@angular/router';
import { AutoSavePage } from './auto-save.page';
import { unsavedChangesGuard } from './unsaved-changes.guard';

export const routes: Routes = [
  { path: '', component: AutoSavePage, canDeactivate: [unsavedChangesGuard] },
];
