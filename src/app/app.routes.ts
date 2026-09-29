import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'mantenimiento', loadComponent: () => import('./features/mantenimiento/pages/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent) },
      { path: 'novedades-cx', loadComponent: () => import('./features/novedades-cx/pages/novedades-cx/novedades-cx.component').then(m => m.NovedadesCXComponent) },
      { path: 'perfil', loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'usuarios', loadComponent: () => import('./features/usuarios/pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
