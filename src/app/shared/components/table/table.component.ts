import { Component, input, output, signal } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  template: `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th 
                [class.sortable]="col.sortable"
                (click)="col.sortable && onSort(col.key)">
                {{ col.label }}
                @if (col.sortable && sortKey() === col.key) {
                  <span class="sort-icon">{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                }
              </th>
            }
            @if (hasActions()) {
              <th>Acciones</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track $index) {
            <tr>
              @for (col of columns(); track col.key) {
                <td>{{ row[col.key] }}</td>
              }
              @if (hasActions()) {
                <td class="actions">
                  <ng-content select="[actions]"></ng-content>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)" class="empty">
                {{ emptyMessage() }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper {
      overflow-x: auto;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      font-size: 0.8125rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { background: #f1f5f9; }
    .sort-icon { margin-left: 0.25rem; }
    td { font-size: 0.9375rem; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    .actions { white-space: nowrap; }
    .empty {
      text-align: center;
      color: #94a3b8;
      padding: 2rem;
    }
  `]
})
export class TableComponent {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();
  emptyMessage = input('No hay datos');
  hasActions = input(false);
  sortKey = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();

  onSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({ key: this.sortKey()!, direction: this.sortDirection() });
  }
}
