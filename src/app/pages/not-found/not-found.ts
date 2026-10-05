import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-icon aria-hidden="true">explore_off</mat-icon>
    <h1>Page not found</h1>
    <p>This URL does not belong to any of the 27 demos.</p>
    <a mat-flat-button routerLink="/">Back to the overview</a>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 64px 16px;
      text-align: center;
    }
    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-primary);
    }
    h1 {
      font: var(--mat-sys-headline-medium);
      margin: 0;
    }
  `,
})
export class NotFound {}
