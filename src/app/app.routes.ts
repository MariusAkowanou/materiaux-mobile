import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then((m) => m.SplashPage),
  },
  { 
    path: 'auth',
    loadChildren: () =>
      import('./layout/auth-shell/auth-shell.routes').then(
        (m) => m.authShellRoutes,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./layout/dashboard-shell/dashboard-shell.routes').then(
        (m) => m.dashboardShellRoutes,
      ),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
