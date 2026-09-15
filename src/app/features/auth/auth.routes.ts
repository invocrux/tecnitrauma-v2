import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) }
];
