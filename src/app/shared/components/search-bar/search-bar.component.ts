import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  template: `
    <div class="search-bar">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        type="text" 
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="valueChange.emit($event)"
        (keyup.escape)="clear.emit()" />
      @if (value()) {
        <button class="clear-btn" (click)="clear.emit()" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: #94a3b8;
      pointer-events: none;
    }
    input {
      width: 100%;
      padding: 0.5rem 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.9375rem;
      background: #fff;
    }
    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .clear-btn {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: #94a3b8;
      border-radius: 0.25rem;
    }
    .clear-btn:hover { color: #475569; background: #f1f5f9; }
  `]
})
export class SearchBarComponent {
  value = input('');
  placeholder = input('Search...');
  valueChange = output<string>();
  clear = output<void>();
}
