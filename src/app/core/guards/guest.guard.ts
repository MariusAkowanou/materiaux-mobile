import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/api/auth/auth.store';
import { StorageService } from '../services/local/storage.service';

/**
 * GuestGuard — Protège les routes /auth/* (login, register, verify-otp).
 * Si l'utilisateur est déjà authentifié, il est redirigé vers le dashboard.
 * Évite qu'un utilisateur connecté revienne sur la page de connexion.
 */
export const guestGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const storage  = inject(StorageService);
  const router   = inject(Router);

  // 1. Déjà en mémoire → redirection immédiate (synchrone)
  if (authStore.currentUser()) {
    return router.createUrlTree(['/dashboard/home']);
  }

  // 2. Vérifier si un token valide existe en stockage
  const token = await storage.getAccessToken();
  if (token) {
    await authStore.loadCurrentUser();
    if (authStore.currentUser()) {
      return router.createUrlTree(['/dashboard/home']);
    }
  }

  // 3. Pas de session → laisser passer vers /auth
  return true;
};
