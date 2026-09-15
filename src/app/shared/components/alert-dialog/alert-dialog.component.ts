import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-alert-dialog',
  imports: [TranslatePipe, ButtonComponent],
  template: `
    @if (open()) {
      <div class="overlay" (click)="onCancel()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3>{{ title() | translate }}</h3>
          <p>{{ message() | translate }}</p>
          <div class="actions">
            <app-button variant="secondary" (clicked)="onCancel()">
              {{ 'common.cancel' | translate }}
            </app-button>
            <app-button [variant]="confirmVariant()" (clicked)="onConfirm()">
              {{ confirmText() | translate }}
            </app-button>
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
    }
    h3 { margin: 0 0 0.5rem; font-size: 1.125rem; }
    p { margin: 0 0 1.5rem; color: #64748b; }
    .actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
  `]
})
export class AlertDialogComponent {
  open = input(false);
  title = input('common.confirm');
  message = input('');
  confirmText = input('common.confirm');
  confirmVariant = input<'primary' | 'danger'>('primary');
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
