import { Component, signal } from '@angular/core';
import { PageTitleComponent } from '../../shared/components/page-title/page-title.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { TableComponent, TableColumn } from '../../shared/components/table/table.component';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';

interface SampleItem {
  id: number;
  name: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    PageTitleComponent,
    MetricCardComponent,
    SearchBarComponent,
    TableComponent,
    ConfirmDeleteModalComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-page-title 
      title="Dashboard" 
      subtitle="Resumen de tu aplicación">
    </app-page-title>

    <div class="metrics-grid">
      <app-metric-card label="Total Items" [value]="items().length" iconBg="#3b82f6">
        <svg icon xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
      </app-metric-card>

      <app-metric-card label="Activos" [value]="activeCount()" iconBg="#22c55e">
        <svg icon xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </app-metric-card>

      <app-metric-card label="Pendientes" [value]="pendingCount()" iconBg="#f59e0b">
        <svg icon xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </app-metric-card>
    </div>

    <div class="search-section">
      <app-search-bar
        [value]="searchQuery()"
        placeholder="Buscar elementos..."
        (valueChange)="onSearch($event)"
        (clear)="onSearchClear()">
      </app-search-bar>
    </div>

    @if (showAlert()) {
      <app-alert message=" Este es un mensaje de alerta de éxito" type="success"></app-alert>
    }

    <div class="table-section">
      <div class="table-header">
        <h3>Lista de Elementos</h3>
        <app-button (clicked)="addItem()">Agregar</app-button>
      </div>

      <app-table
        [columns]="columns"
        [data]="filteredItems()"
        [hasActions]="true"
        emptyMessage="No se encontraron elementos">
        <ng-container actions>
          <button class="action-btn edit" (click)="editItem($event)">Editar</button>
          <button class="action-btn delete" (click)="confirmDelete($event)">Eliminar</button>
        </ng-container>
      </app-table>
    </div>

    <app-confirm-delete-modal
      [open]="showDeleteModal()"
      itemName="este elemento"
      (confirmed)="onConfirmDelete()"
      (cancelled)="onCancelDelete()">
    </app-confirm-delete-modal>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-section {
      max-width: 400px;
      margin-bottom: 1.5rem;
    }
    .table-section {
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1rem;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .table-header h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #1e293b;
    }
    .action-btn {
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.8125rem;
      cursor: pointer;
      margin-right: 0.25rem;
    }
    .action-btn.edit { background: #eff6ff; color: #2563eb; }
    .action-btn.edit:hover { background: #dbeafe; }
    .action-btn.delete { background: #fef2f2; color: #dc2626; }
    .action-btn.delete:hover { background: #fee2e2; }
  `]
})
export class DashboardComponent {
  searchQuery = signal('');
  showAlert = signal(false);
  showDeleteModal = signal(false);

  items = signal<SampleItem[]>([
    { id: 1, name: 'Elemento 1', status: 'Activo', date: '2024-01-15' },
    { id: 2, name: 'Elemento 2', status: 'Activo', date: '2024-01-14' },
    { id: 3, name: 'Elemento 3', status: 'Pendiente', date: '2024-01-13' },
    { id: 4, name: 'Elemento 4', status: 'Activo', date: '2024-01-12' },
  ]);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'date', label: 'Fecha' },
  ];

  filteredItems = () => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  };

  activeCount = () => this.items().filter(i => i.status === 'Activo').length;
  pendingCount = () => this.items().filter(i => i.status === 'Pendiente').length;

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSearchClear(): void {
    this.searchQuery.set('');
  }

  addItem(): void {
    this.showAlert.set(true);
    setTimeout(() => this.showAlert.set(false), 3000);
  }

  editItem(event: Event): void {
    console.log('Edit', event);
  }

  confirmDelete(event: Event): void {
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    this.showDeleteModal.set(false);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }
}
