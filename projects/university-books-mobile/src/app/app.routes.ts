import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
    title: 'Home - University Books'
  },
  {
    path: 'activity',
    loadComponent: () => import('./pages/activity/activity.component').then((m) => m.ActivityComponent),
    canActivate: [authGuard],
    title: 'My Activity - University Books'
  }
];
