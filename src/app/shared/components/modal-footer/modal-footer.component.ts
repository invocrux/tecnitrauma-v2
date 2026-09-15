import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-footer',
  template: `
    <div class="modal-footer">
      <button class="btn-secondary" (click)="onCancel.emit()">
        {{ cancelText() }}
      </button>
      <button 
        class="btn-primary" 
        [disabled]="disabled()"
        (click)="onConfirm.emit()">
        {{ confirmText() }}
      </button>
    </div>
  `,
  styles: [`
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 1rem;
    }
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
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ModalFooterComponent {
  confirmText = input('Guardar');
  cancelText = input('Cancelar');
  disabled = input(false);
  onConfirm = output<void>();
  onCancel = output<void>();
}
