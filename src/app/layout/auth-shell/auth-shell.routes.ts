import { Routes } from '@angular/router';
import { AuthShellComponent } from './auth-shell.component';

export const authShellRoutes: Routes = [
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../../features/auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../../features/auth/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('../../features/auth/verify-otp/verify-otp.page').then((m) => m.VerifyOtpPage),
      },
    ],
  },
];
