import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../services/api/auth/auth.model';
import { AuthStore } from '../services/api/auth/auth.store';
import { ToastService } from '../services/local/toast.service';

/**
 * Retourne la route d'accueil correspondant au rôle principal de l'utilisateur.
 */
function homeRouteForRole(role: UserRole | null): string[] {
  switch (role) {
    case 'SUPPLIER':    return ['/dashboard/supplier/dashboard'];
    case 'TRANSPORTER': return ['/dashboard/transporter/dashboard'];
    case 'ADMIN':       return ['/dashboard/admin/utilisateurs'];
    case 'CLIENT':
    default:            return ['/dashboard/home'];
  }
}

/**
 * RoleGuard — Vérifie que l'utilisateur possède l'un des rôles requis définis
 * dans `route.data.roles`. Si non, redirige vers la page d'accueil de son rôle.
 *
 * Usage dans les routes :
 * { path: '...', canActivate: [roleGuard], data: { roles: ['ADMIN'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const requiredRoles: UserRole[] = route.data?.['roles'] ?? [];

  if (!requiredRoles.length) {
    return true;
  }

  const authStore = inject(AuthStore);
  const toast     = inject(ToastService);
  const router    = inject(Router);

  const hasAccess = requiredRoles.some((role) => authStore.hasRole(role));

  if (hasAccess) {
    return true;
  }

  toast.error('Accès réservé — rôle insuffisant');
  return router.createUrlTree(homeRouteForRole(authStore.primaryRole()));
};
