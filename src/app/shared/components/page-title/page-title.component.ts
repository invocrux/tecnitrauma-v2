import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-title',
  template: `
    <div class="page-title">
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p class="subtitle">{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: [`
    .page-title {
      margin-bottom: 1.5rem;
    }
    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    .subtitle {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: 0.9375rem;
    }
  `]
})
export class PageTitleComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
