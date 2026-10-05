import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DeferLog } from './defer-log';

@Component({
  selector: 'app-report-panel',
  imports: [CurrencyPipe],
  template: `
    <table>
      <caption>
        Quarterly report
      </caption>
      <thead>
        <tr>
          <th scope="col">Quarter</th>
          <th scope="col">Revenue</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows; track row.q) {
          <tr>
            <td>{{ row.q }}</td>
            <td>{{ row.revenue | currency: 'EUR' : 'symbol' : '1.0-0' }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    table {
      border-collapse: collapse;
      width: 100%;
    }
    caption {
      text-align: start;
      font: var(--mat-sys-title-small);
    }
    td,
    th {
      padding: 4px 8px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      text-align: start;
    }
  `,
})
export class ReportPanel {
  readonly rows = [
    { q: 'Q1', revenue: 120000 },
    { q: 'Q2', revenue: 135500 },
    { q: 'Q3', revenue: 151200 },
    { q: 'Q4', revenue: 172900 },
  ];

  constructor() {
    inject(DeferLog).loaded('ReportPanel (when showReport())');
  }
}
