import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-header',
  imports: [TranslatePipe],
  template: `
    <div class="modal-header">
      <h2>{{ title() | translate }}</h2>
      <button class="close-btn" (click)="onClose.emit()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
    .close-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #64748b;
      border-radius: 0.375rem;
    }
    .close-btn:hover { background: #f1f5f9; color: #1e293b; }
  `]
})
export class ModalHeaderComponent {
  title = input.required<string>();
  onClose = output<void>();
}
