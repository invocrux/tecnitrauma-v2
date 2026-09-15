import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <header class="header">
      <button class="menu-toggle" (click)="toggleSidebar.emit()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div class="header-title">
        <h1>{{ title() }}</h1>
      </div>

      <div class="header-actions">
        <span class="user-name">{{ userName() }}</span>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      gap: 1rem;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #475569;
    }

    @media (max-width: 1023px) {
      .menu-toggle { display: block; }
    }

    .header-title h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .header-actions {
      margin-left: auto;
    }

    .user-name {
      font-size: 0.875rem;
      color: #64748b;
    }
  `]
})
export class HeaderComponent {
  title = input('Dashboard');
  userName = input('');
  toggleSidebar = output<void>();
}
