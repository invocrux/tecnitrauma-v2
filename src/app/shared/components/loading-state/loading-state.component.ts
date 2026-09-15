import { Component, input, output, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <div class="loading-state">
      @if (loading()) {
        <div class="spinner"></div>
      }
      @if (error()) {
        <div class="error">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error() }}</span>
          <button (click)="retry.emit()">Reintentar</button>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: #dc2626;
      text-align: center;
    }
    button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    button:hover { background: #2563eb; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingStateComponent {
  loading = input(false);
  error = input<string | null>(null);
  retry = output<void>();
}
