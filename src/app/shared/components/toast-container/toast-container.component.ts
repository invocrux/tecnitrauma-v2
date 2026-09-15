import { Component, input, output, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="toast.type">
          @switch (toast.type) {
            @case ('success') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            }
            @case ('error') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            }
            @case ('warning') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            }
            @default {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            }
          }
          <span>{{ toast.message }}</span>
          <button (click)="dismiss(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 9999;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 280px;
      max-width: 400px;
      animation: slideIn 0.2s ease-out;
    }
    .toast.success { border-left: 4px solid #22c55e; color: #15803d; }
    .toast.error { border-left: 4px solid #ef4444; color: #dc2626; }
    .toast.warning { border-left: 4px solid #f59e0b; color: #d97706; }
    .toast.info { border-left: 4px solid #3b82f6; color: #2563eb; }
    span { flex: 1; font-size: 0.875rem; }
    button {
      background: none; border: none; padding: 0.25rem;
      cursor: pointer; color: inherit; opacity: 0.6;
    }
    button:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info'): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.update(t => [...t, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
