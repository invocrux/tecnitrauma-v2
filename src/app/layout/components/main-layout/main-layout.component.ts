import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="layout">
      <app-sidebar 
        [isOpen]="sidebarOpen()"
        [isMobile]="isMobile()"
        [isCollapsed]="sidebarCollapsed()"
        (toggle)="toggleSidebar()"
        (collapseChange)="toggleSidebarCollapse()"
        (logout)="logout()">
      </app-sidebar>

      <div class="main-content" [class.sidebar-open]="sidebarOpen()" [class.sidebar-collapsed]="sidebarCollapsed()">
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
      <app-toast-container></app-toast-container>
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
        margin-left: 280px;
      }
      .main-content.sidebar-collapsed {
        margin-left: 72px;
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
  sidebarCollapsed = signal(false);
  pageTitle = signal('Dashboard');
  isMobile = signal(false);
  userEmail = signal('');

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

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
