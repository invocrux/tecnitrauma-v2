import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout">
      <app-sidebar 
        [isOpen]="sidebarOpen()"
        [isMobile]="isMobile()"
        [navItems]="navItems"
        (toggle)="toggleSidebar()"
        (logout)="logout()">
      </app-sidebar>

      <div class="main-content" [class.sidebar-open]="sidebarOpen()">
        <app-header
          [title]="pageTitle()"
          [userName]="userEmail()"
          (toggleSidebar)="toggleSidebar()">
        </app-header>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (isMobile() && sidebarOpen()) {
        <div class="overlay" (click)="toggleSidebar()"></div>
      }
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      background: #f8fafc;
    }

    .main-content {
      margin-left: 0;
      transition: margin-left 0.25s ease-in-out;
    }

    @media (min-width: 1024px) {
      .main-content.sidebar-open {
        margin-left: 260px;
      }
    }

    .page-content {
      padding: 1.5rem;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 50;
    }
  `]
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  sidebarOpen = signal(true);
  pageTitle = signal('Dashboard');
  isMobile = signal(false);
  userEmail = signal('');

  navItems: NavItem[] = [
    { labelKey: 'nav.home', route: '/dashboard', icon: 'lucideHome' },
    { labelKey: 'nav.users', route: '/users', icon: 'lucideUsers' },
    { labelKey: 'nav.settings', route: '/settings', icon: 'lucideSettings' },
  ];

  constructor() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth < 1024);
    if (!this.isMobile()) {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
