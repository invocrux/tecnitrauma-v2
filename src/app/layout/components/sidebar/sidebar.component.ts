import { Component, input, output, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideMenu, 
  lucideLayoutDashboard,
  lucidePackage,
  lucideLayers,
  lucideClipboardCheck,
  lucideWrench,
  lucideFileText,
  lucideBarChart3,
  lucideBookOpen,
  lucideUsers,
  lucideSettings,
  lucideLogOut,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  providers: [provideIcons({ 
    lucideMenu,
    lucideLayoutDashboard,
    lucidePackage,
    lucideLayers,
    lucideClipboardCheck,
    lucideWrench,
    lucideFileText,
    lucideBarChart3,
    lucideBookOpen,
    lucideUsers,
    lucideSettings,
    lucideLogOut,
    lucideChevronLeft,
    lucideChevronRight
  })],
  template: `
    <aside class="sidebar" [class.open]="isOpen()" [class.collapsed]="isCollapsed()">
      <div class="sidebar-header">
        <button class="menu-btn" (click)="toggle.emit()">
          <ng-icon name="lucideMenu"></ng-icon>
        </button>
        
        <div class="logo-section" [class.hidden]="isCollapsed()">
          <div class="logo-icon">
            <ng-icon name="lucidePackage"></ng-icon>
          </div>
          <span class="logo-text">Tecnitrauma</span>
        </div>

        <button class="collapse-btn" (click)="toggleCollapse()">
          <ng-icon [name]="isCollapsed() ? 'lucideChevronRight' : 'lucideChevronLeft'"></ng-icon>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        @for (item of navItems(); track item.route) {
          <a 
            [routerLink]="item.route" 
            routerLinkActive="active"
            class="nav-item"
            [attr.title]="isCollapsed() ? item.label : null"
            (click)="isMobile() && toggle.emit()">
            <ng-icon [name]="item.icon"></ng-icon>
            <span class="nav-label" [class.hidden]="isCollapsed()">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        @if (auth.session()) {
          <div class="user-info" [class.collapsed]="isCollapsed()">
            <div class="user-avatar">
              <ng-icon name="lucideUsers"></ng-icon>
            </div>
            <div class="user-details" [class.hidden]="isCollapsed()">
              <span class="user-email">{{ auth.session()?.user?.email }}</span>
              <span class="user-role">Administrador</span>
            </div>
          </div>
        }
        <button 
          class="nav-item logout" 
          [attr.title]="isCollapsed() ? 'Cerrar Sesión' : null"
          (click)="logout.emit()">
          <ng-icon name="lucideLogOut"></ng-icon>
          <span class="nav-label" [class.hidden]="isCollapsed()">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: #0F172A;
      color: #E2E8F0;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width 0.25s ease-in-out, transform 0.25s ease-in-out;
    }

    .sidebar:not(.open) {
      transform: translateX(-100%);
    }

    .sidebar.collapsed {
      width: 72px;
    }

    @media (max-width: 1023px) {
      .sidebar { transform: translateX(0); }
      .sidebar.collapsed { width: 280px; }
      .menu-btn { display: none; }
      .collapse-btn { display: none; }
    }

    @media (min-width: 1024px) {
      .sidebar.collapsed .collapse-btn {
        position: absolute;
        right: -12px;
        top: 72px;
        background: #0F172A;
        border: 1px solid #1E293B;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 110;
      }
    }

    .sidebar-header {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #1E293B;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 72px;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
    }

    .menu-btn:hover { background: #1E293B; }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      overflow: hidden;
    }

    .logo-section.hidden {
      display: none;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: #2563EB;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .logo-text {
      font-weight: 700;
      font-size: 1.25rem;
      color: #F8FAFC;
      white-space: nowrap;
    }

    .collapse-btn {
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      margin-left: auto;
    }

    .collapse-btn:hover { background: #1E293B; }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      color: #94A3B8;
      text-decoration: none;
      border-radius: 0.5rem;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      font-size: 0.9375rem;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem 0.5rem;
    }

    .nav-item:hover { 
      background: #1E293B; 
      color: #E2E8F0;
    }

    .nav-item.active { 
      background: #2563EB; 
      color: #fff;
    }

    .nav-label.hidden {
      display: none;
    }

    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid #1E293B;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #1E293B;
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }

    .user-info.collapsed {
      padding: 0.5rem;
      justify-content: center;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: #334155;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94A3B8;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
    }

    .user-details.hidden {
      display: none;
    }

    .user-email {
      font-size: 0.8125rem;
      color: #E2E8F0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.6875rem;
      color: #64748B;
    }

    .logout { 
      color: #F87171; 
      width: 100%;
    }
    
    .logout:hover { 
      background: #7F1D1D; 
      color: #FCA5A5; 
    }

    ng-icon {
      flex-shrink: 0;
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
  
  isOpen = input(true);
  isMobile = input(false);
  isCollapsed = input(false);
  
  navItems = signal<NavItem[]>([
    { label: 'Instrumentales', route: '/instrumentales', icon: 'lucideLayoutDashboard' },
    { label: 'Contenido de Sets', route: '/sets', icon: 'lucideLayers' },
    { label: 'Revisión Post-CX', route: '/revision', icon: 'lucideClipboardCheck' },
    { label: 'Reporte de Mantenimiento', route: '/mantenimiento', icon: 'lucideWrench' },
    { label: 'Reporte de Novedades', route: '/novedades', icon: 'lucideFileText' },
    { label: 'Informes', route: '/informes', icon: 'lucideBarChart3' },
    { label: 'Documentación', route: '/documentacion', icon: 'lucideBookOpen' },
    { label: 'Usuarios', route: '/usuarios', icon: 'lucideUsers' },
    { label: 'Configuración', route: '/configuracion', icon: 'lucideSettings' },
  ]);
  
  toggle = output<void>();
  collapseChange = output<boolean>();
  logout = output<void>();

  toggleCollapse(): void {
    this.collapseChange.emit(!this.isCollapsed());
  }
}
