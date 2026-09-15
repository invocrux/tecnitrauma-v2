import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button 
      [type]="type()"
      [class]="variant()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .primary { background: #3b82f6; color: #fff; }
    .primary:hover:not(:disabled) { background: #2563eb; }
    .secondary { background: #e2e8f0; color: #475569; }
    .secondary:hover:not(:disabled) { background: #cbd5e1; }
    .danger { background: #ef4444; color: #fff; }
    .danger:hover:not(:disabled) { background: #dc2626; }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  loading = input(false);
  clicked = output<MouseEvent>();
}
