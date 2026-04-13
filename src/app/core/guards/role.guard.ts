import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../services/api/auth/auth.model';
import { AuthStore } from '../services/api/auth/auth.store';
import { ToastService } from '../services/local/toast.service';

export const roleGuard: CanActivateFn = (route) => {
  const requiredRoles: UserRole[] = route.data?.['roles'] ?? [];

  if (!requiredRoles.length) {
    return true;
  }

  const authStore = inject(AuthStore);
  const toast = inject(ToastService);
  const router = inject(Router);

  const hasAccess = requiredRoles.some((role) => authStore.hasRole(role));

  if (hasAccess) {
    return true;
  }

  toast.error('Accès réservé');
  return router.createUrlTree(['/dashboard/home']);
};
