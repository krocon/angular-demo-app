import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, email, form, minLength, required, schema } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface Login {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const EMPTY_LOGIN: Login = { email: '', password: '', rememberMe: false };

export const loginSchema = schema<Login>((path) => {
  required(path.email, { message: 'Email is required.' });
  email(path.email, { message: 'Invalid email.' });
  required(path.password, { message: 'Password is required.' });
  minLength(path.password, 8, { message: 'At least 8 characters.' });
});

/** The "system under test": a small login form built with Signal Forms. */
@Component({
  selector: 'app-login-form',
  imports: [FormField, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  template: `
    <form class="demo-stack" novalidate (submit)="$event.preventDefault(); submit()">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" [formField]="login.email" data-testid="email" />
        @if (login.email().errors()[0]; as e) {
          <mat-error>{{ e.message }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput type="password" [formField]="login.password" data-testid="password" />
        @if (login.password().errors()[0]; as e) {
          <mat-error>{{ e.message }}</mat-error>
        }
      </mat-form-field>
      <mat-checkbox [formField]="login.rememberMe">Remember me</mat-checkbox>
      <button mat-flat-button type="submit" [disabled]="!canSubmit()" data-testid="submit">
        {{ submitLabel() }}
      </button>
    </form>
  `,
})
export class LoginForm {
  readonly submitLabel = input('Sign in');
  readonly loggedIn = output<Login>();

  readonly model = signal<Login>({ ...EMPTY_LOGIN });
  readonly login = form(this.model, loginSchema);
  readonly canSubmit = computed(() => this.login().valid());

  submit(): void {
    if (this.canSubmit()) {
      this.loggedIn.emit(this.model());
    }
  }
}
