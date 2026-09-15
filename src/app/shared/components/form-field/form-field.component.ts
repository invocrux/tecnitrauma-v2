import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  imports: [FormsModule],
  template: `
    <div class="form-field" [class.error]="error()">
      <label [for]="inputId()">{{ label() }}</label>
      <ng-content></ng-content>
      @if (error()) {
        <span class="error-text">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
    }
    .hint {
      font-size: 0.75rem;
      color: #6b7280;
    }
  `]
})
export class FormFieldComponent {
  label = input.required<string>();
  error = input<string | null>(null);
  hint = input<string | null>(null);
  inputId = input<string>('');
}
