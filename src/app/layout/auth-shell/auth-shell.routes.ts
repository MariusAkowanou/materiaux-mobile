import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../../features/auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../../features/auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('../../features/auth/verify-otp/verify-otp.page').then(m => m.VerifyOtpPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
