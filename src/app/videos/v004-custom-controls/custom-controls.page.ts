import { Component, computed, signal } from '@angular/core';
import {
  FormField,
  disabled,
  form,
  maxLength,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DemoPage } from '../../shared/demo-page/demo-page';
import { StateInspector } from '../../shared/state-inspector/state-inspector';
import { BEFORE_AFTER, SNIPPETS } from './custom-controls.snippets';
import { StarRating } from './star-rating';
import { TagInput } from './tag-input';

export interface Review {
  title: string;
  rating: number;
  tags: string[];
  comment: string;
}

/** Video 004 – Custom controls with model(): StarRating and TagInput bind like native inputs. */
@Component({
  selector: 'app-custom-controls-page',
  imports: [
    DemoPage,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    StarRating,
    StateInspector,
    TagInput,
  ],
  templateUrl: './custom-controls.page.html',
})
export class CustomControlsPage {
  readonly snippets = SNIPPETS;
  readonly beforeAfter = BEFORE_AFTER;

  readonly ratingLocked = signal(false);
  readonly model = signal<Review>({ title: '', rating: 0, tags: ['angular'], comment: '' });

  readonly review = form(this.model, (path) => {
    required(path.title, { message: 'Give your review a title.' });
    min(path.rating, 1, { message: 'Please pick 1 to 5 stars.' });
    maxLength(path.tags, 5, { message: 'At most 5 tags.' });
    minLength(path.comment, 10, { message: 'At least 10 characters.' });
    // `disabled` arrives in the custom control automatically – no extra wiring.
    disabled(path.rating, { when: () => (this.ratingLocked() ? 'Rating is locked' : false) });
  });

  readonly ratingState = computed(() => {
    const rating = this.review.rating();
    return {
      value: rating.value(),
      disabled: rating.disabled(),
      touched: rating.touched(),
      invalid: rating.invalid(),
      reasons: rating.disabledReasons().map((r) => r.message),
    };
  });

  submit(): void {
    this.review().markAsTouched();
  }
}
