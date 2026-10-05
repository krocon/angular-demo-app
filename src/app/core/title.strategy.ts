import { Service, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_TITLE = 'Angular 22 Demos';

/** Renders "<Route title> · Angular 22 Demos". */
@Service({ autoProvided: false })
export class AppTitleStrategy extends TitleStrategy {
  readonly #title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    this.#title.setTitle(title ? `${title} · ${APP_TITLE}` : APP_TITLE);
  }
}
