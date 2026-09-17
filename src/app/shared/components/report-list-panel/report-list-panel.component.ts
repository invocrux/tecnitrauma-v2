import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { DatePipe } from '@angular/common';

export interface ReportListItem {
  id: string | number;
  num_remision?: string;
  serial?: string;
  estado: string;
  tipo?: string | null;
  fecha?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-report-list-panel',
  imports: [FormsModule, NgIconComponent, DatePipe],
  providers: [provideIcons({ lucidePlus, lucideSearch })],
  template: `
    <div class="list-panel">
      <div class="list-toolbar">
        <button class="btn-nuevo" (click)="onNewClicked.emit()">
          <ng-icon name="lucidePlus"></ng-icon>
          Nuevo
        </button>
      </div>
      <div class="search-box">
        <ng-icon name="lucideSearch" class="search-icon"></ng-icon>
        <input 
          type="text" 
          [placeholder]="searchPlaceholder()"
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchChange($event)"
        />
      </div>
      <div class="list-container">
        @if (isLoading() && items().length === 0) {
          <div class="loading-state">Cargando...</div>
        } @else if (items().length === 0) {
          <div class="empty-state">Sin registros</div>
        } @else {
          @for (item of items(); track item.id) {
            <div 
              class="list-card"
              [class.selected]="selectedId() === item.id"
              (click)="onItemClicked.emit(item)">
              <div class="card-header">
                <span class="card-primary">{{ item.num_remision || item.serial || '—' }}</span>
                <span class="badge" [class]="'badge-' + item.estado">{{ item.estado }}</span>
              </div>
              @if (item.tipo || item.fecha) {
                <div class="card-content">
                  <span class="card-secondary">{{ getTipoLabel(item.tipo) }}</span>
                  <span class="card-date">{{ item.fecha | date:'dd/MM/yyyy' }}</span>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .list-panel {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
      box-sizing: border-box;
    }

    .list-toolbar {
      display: flex;
      gap: 0.5rem;
    }

    .btn-nuevo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-nuevo:hover {
      background: #1d4ed8;
    }

    .btn-nuevo ng-icon {
      width: 16px;
      height: 16px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box .search-icon {
      position: absolute;
      left: 0.75rem;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    .search-box input:focus {
      outline: none;
      border-color: #2563eb;
    }

    .list-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 0;
    }

    .loading-state, .empty-state {
      padding: 1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }

    .list-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .list-card:hover {
      border-color: #2563eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .list-card.selected {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .card-primary {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1e293b;
    }

    .card-content {
      display: flex;
      justify-content: space-between;
    }

    .card-secondary {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .card-date {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .badge {
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: capitalize;
    }

    .badge-borrador { background: #e2e8f0; color: #475569; }
    .badge-enviado { background: #dbeafe; color: #1d4ed8; }
    .badge-completado { background: #dcfce7; color: #15803d; }
  `]
})
export class ReportListPanelComponent {
  items = input<ReportListItem[]>([]);
  selectedId = input<string | number | null>(null);
  searchPlaceholder = input('Buscar...');
  searchTerm = input('');
  isLoading = input(false);

  onNewClicked = output<void>();
  onItemClicked = output<ReportListItem>();
  onSearchChanged = output<string>();

  getTipoLabel(tipo: string | null | undefined): string {
    if (!tipo) return '';
    const labels: Record<string, string> = {
      correctivo: 'Correctivo',
      predictivo: 'Predictivo',
      preventivo: 'Preventivo'
    };
    return labels[tipo] || tipo;
  }

  onSearchChange(value: string): void {
    this.onSearchChanged.emit(value);
  }
}
