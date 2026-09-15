import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-alert',
  imports: [TranslatePipe],
  template: `
    @if (message()) {
      <div class="alert" [class]="type()">
        <span>{{ message() | translate }}</span>
      </div>
    }
  `,
  styles: [`
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    .error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .warning { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  `]
})
export class AlertComponent {
  message = input<string>('');
  type = input<'error' | 'success' | 'warning' | 'info'>('info');
}
