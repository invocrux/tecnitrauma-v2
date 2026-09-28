import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';

export interface SearchItem {
  id: string | number;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-search-modal',
  imports: [FormsModule, NgIconComponent],
  providers: [provideIcons({ lucideSearch, lucideX })],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ title() }}</h2>
            <button class="close-btn" (click)="close()">
              <ng-icon name="lucideX" />
            </button>
          </div>

          <div class="search-input-wrapper">
            <ng-icon name="lucideSearch" class="search-icon" />
            <input
              #searchInput
              type="text"
              [(ngModel)]="searchTerm"
              [placeholder]="placeholder()"
              class="search-input"
              (input)="onSearch()"
            />
          </div>

          <div class="results-list">
            @for (item of filteredItems(); track item.id) {
              <button
                class="result-item"
                [class.selected]="item.id === selectedId()"
                (click)="selectItem(item)"
              >
                <span class="item-label">{{ item.label }}</span>
                @if (item.sublabel) {
                  <span class="item-sublabel">{{ item.sublabel }}</span>
                }
              </button>
            } @empty {
              <div class="no-results">No se encontraron resultados</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="close()">Cancelar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #6b7280;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .search-input-wrapper {
      position: relative;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-icon {
      position: absolute;
      left: 2rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 0.75rem 0.625rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .results-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .result-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: background-color 0.1s;
    }

    .result-item:hover {
      background: #f3f4f6;
    }

    .result-item.selected {
      background: #eff6ff;
    }

    .item-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }

    .item-sublabel {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.125rem;
    }

    .no-results {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .modal-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel {
      width: 100%;
      padding: 0.625rem 1rem;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.1s;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }
  `]
})
export class SearchModalComponent {
  title = input.required<string>();
  placeholder = input<string>('Buscar...');
  items = input.required<SearchItem[]>();
  selectedId = input<number | string | null>(null);
  isOpen = input<boolean>(false);

  itemSelected = output<SearchItem>();
  closed = output<void>();

  searchTerm = signal('');
  private internalSelectedId = signal<string | number | null>(null);

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.items();

    return this.items().filter(item =>
      item.label.toLowerCase().includes(term) ||
      item.sublabel?.toLowerCase().includes(term)
    );
  });

  get currentSelectedId(): number | string | null {
    return this.selectedId() ?? this.internalSelectedId();
  }

  onSearch(): void {
  }

  selectItem(item: SearchItem): void {
    this.internalSelectedId.set(item.id);
    this.itemSelected.emit(item);
    this.close();
  }

  onOverlayClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  close(): void {
    this.searchTerm.set('');
    this.closed.emit();
  }
}
