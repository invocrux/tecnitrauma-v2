import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    @if (open()) {
      <div class="overlay" (click)="onCancel()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <h3>Eliminar {{ itemName() }}</h3>
          <p>¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.</p>
          <div class="actions">
            <button class="btn-secondary" (click)="onCancel()">Cancelar</button>
            <button class="btn-danger" (click)="onConfirm()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .dialog {
      background: #fff;
      padding: 1.5rem;
      border-radius: 0.5rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
    }
    .icon-wrapper {
      width: 48px; height: 48px;
      background: #fef2f2;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
      color: #dc2626;
    }
    h3 { margin: 0 0 0.5rem; font-size: 1.125rem; color: #1e293b; }
    p { margin: 0 0 1.5rem; color: #64748b; font-size: 0.9375rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; }
    button {
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
    .btn-danger { background: #dc2626; color: #fff; }
    .btn-danger:hover { background: #b91c1c; }
  `]
})
export class ConfirmDeleteModalComponent {
  open = input(false);
  itemName = input('elemento');
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
