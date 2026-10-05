export const EXAMPLES: readonly { label: string; code: string }[] = [
  {
    label: 'Example 1 – "classic" AI answer',
    code: `import { Component, Input, Output, EventEmitter, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  template: \`
    <div *ngIf="users.length; else empty">
      <div *ngFor="let user of users" [ngClass]="{ active: user.id === selectedId }"
           (click)="select.emit(user.id)">{{ user.name }}</div>
    </div>
    <ng-template #empty>No users</ng-template>
  \`,
})
export class UserListComponent implements OnInit {
  @Input() selectedId: number;
  @Output() select = new EventEmitter<number>();
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/users').subscribe((users) => (this.users = users));
  }
}

@NgModule({ declarations: [UserListComponent], imports: [CommonModule] })
export class UserModule {}
`,
  },
  {
    label: 'Example 2 – half modern',
    code: `@Component({
  selector: 'app-cart',
  standalone: true,
  template: \`
    @for (item of items$ | async) {
      <li>{{ item.name }}</li>
    }
  \`,
})
export class CartComponent {
  private readonly store = inject(CartStore);
  readonly items$ = new BehaviorSubject<Item[]>([]);
  @ViewChild('list') list?: ElementRef;

  @HostListener('window:resize')
  onResize() {}
}
`,
  },
  {
    label: 'Example 3 – Angular 22 style',
    code: `@Component({
  selector: 'app-cart',
  template: \`
    @for (item of store.items(); track item.id) {
      <li [class.sold-out]="!item.stock">{{ item.name }}</li>
    } @empty {
      <li>Your cart is empty.</li>
    }
  \`,
  host: { '(window:resize)': 'onResize()' },
})
export class Cart {
  readonly store = inject(CartStore);
  readonly highlighted = input(false);
  readonly checkout = output<void>();
  readonly list = viewChild<ElementRef>('list');

  onResize(): void {}
}
`,
  },
];
