import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  template: `
    <div class="metric-card" [class.clickable]="clickable()">
      <div class="icon" [style.background]="iconBg()">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="content">
        <span class="value">{{ value() }}</span>
        <span class="label">{{ label() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      background: #fff;
      border-radius: 0.5rem;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-card.clickable { cursor: pointer; }
    .metric-card.clickable:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .content {
      display: flex;
      flex-direction: column;
    }
    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    .label {
      font-size: 0.875rem;
      color: #64748b;
    }
  `]
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  iconBg = input<string>('#3b82f6');
  clickable = input(false);
}
