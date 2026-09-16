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
      { path: 'mantenimiento', loadComponent: () => import('./features/mantenimiento/pages/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
