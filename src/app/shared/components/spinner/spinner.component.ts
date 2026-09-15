import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="spinner" [class.small]="size() === 'small'" [class.large]="size() === 'large'"></div>
  `,
  styles: [`
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .small { width: 16px; height: 16px; border-width: 2px; }
    .large { width: 48px; height: 48px; border-width: 4px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SpinnerComponent {
  size = input<'small' | 'medium' | 'large'>('medium');
}
