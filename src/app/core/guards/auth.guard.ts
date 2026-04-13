import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthStore } from '../services/api/auth/auth.store';
import { StorageService } from '../services/local/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // 1. Si l'utilisateur est déjà chargé en mémoire, on autorise l'accès immédiatement (synchrone)
  // Cela évite tout "flicker" lors de la navigation entre les onglets du dashboard
  if (authStore.currentUser()) {
    return true;
  }

  // 2. Sinon (premier chargement ou refresh), on vérifie le token et on charge l'utilisateur
  return from(storage.getAccessToken()).pipe(
    switchMap(async (token) => {
      if (!token) {
        return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
      }

      await authStore.loadCurrentUser();

      return authStore.currentUser() 
        ? true 
        : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }),
  );
};
