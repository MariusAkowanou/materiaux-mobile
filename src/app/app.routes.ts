import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Splash — point d'entrée
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then(m => m.SplashPage),
  },

  // Temp route for UI testing without auth guard
  {
    path: 'test-catalog',
    loadComponent: () =>
      import('./features/dashboard/client/catalogue/catalogue.page').then(m => m.CataloguePage),
  },

  // Auth Shell — login, register, verify-otp (bloqué si déjà connecté)
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-shell/auth-shell.component').then(m => m.AuthShellComponent),
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./layout/auth-shell/auth-shell.routes').then(m => m.AUTH_ROUTES),
  },

  // Dashboard Shell — toutes les pages post-login (protégées)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell.component').then(m => m.DashboardShellComponent),
    canActivate: [authGuard],
    loadChildren: () =>
      import('./layout/dashboard-shell/dashboard-shell.routes').then(m => m.DASHBOARD_ROUTES),
  },

  // Route vide → splash
  { path: '', redirectTo: 'splash', pathMatch: 'full' },

  // Wildcard → splash
  { path: '**', redirectTo: 'splash' },
];

