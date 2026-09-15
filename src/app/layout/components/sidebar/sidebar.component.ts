import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideUsers, lucideSettings, lucideLogOut, lucideMenu } from '@ng-icons/lucide';

export interface NavItem {
  labelKey: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, NgIconComponent],
  providers: [provideIcons({ lucideHome, lucideUsers, lucideSettings, lucideLogOut, lucideMenu })],
  template: `
    <aside class="sidebar" [class.open]="isOpen()">
      <div class="sidebar-header">
        <button class="menu-btn" (click)="toggle.emit()">
          <ng-icon name="lucideMenu"></ng-icon>
        </button>
        <span class="logo">TECNITRAUMA V2</span>
      </div>
      
      <nav class="sidebar-nav">
        @for (item of navItems(); track item.route) {
          <a 
            [routerLink]="item.route" 
            routerLinkActive="active"
            class="nav-item"
            (click)="isMobile() && toggle.emit()">
            <ng-icon [name]="item.icon"></ng-icon>
            <span>{{ item.labelKey | translate }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout" (click)="logout.emit()">
          <ng-icon name="lucideLogOut"></ng-icon>
          <span>{{ 'common.logout' | translate }}</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #1e293b;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: transform 0.25s ease-in-out;
    }

    .sidebar:not(.open) {
      transform: translateX(-100%);
    }

    @media (min-width: 1024px) {
      .sidebar { transform: translateX(0); }
      .menu-btn { display: none; }
    }

    .sidebar-header {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #334155;
    }

    .menu-btn {
      background: none;
      border: none;
      color: #e2e8f0;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
    }

    .menu-btn:hover { background: #334155; }

    .logo { font-weight: 700; font-size: 1.125rem; }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 0.5rem;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      font-size: 0.9375rem;
    }

    .nav-item:hover { background: #334155; color: #e2e8f0; }
    .nav-item.active { background: #3b82f6; color: #fff; }

    .sidebar-footer {
      padding: 0.5rem;
      border-top: 1px solid #334155;
    }

    .logout { color: #f87171; }
    .logout:hover { background: #7f1d1d; color: #fca5a5; }
  `]
})
export class SidebarComponent {
  isOpen = input(true);
  isMobile = input(false);
  navItems = input<NavItem[]>([
    { labelKey: 'nav.home', route: '/dashboard', icon: 'lucideHome' },
    { labelKey: 'nav.users', route: '/users', icon: 'lucideUsers' },
    { labelKey: 'nav.settings', route: '/settings', icon: 'lucideSettings' },
  ]);
  toggle = output<void>();
  logout = output<void>();
}
