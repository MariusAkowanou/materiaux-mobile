import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { from } from 'rxjs';
import { AuthApiService } from '../services/api/auth/auth.api.service';
import { AuthStore } from '../services/api/auth/auth.store';
import { StorageService } from '../services/local/storage.service';

const PUBLIC_ROUTES = [
  '/accounts/login',
  '/accounts/register',
  '/accounts/refresh',
  '/partenariats',
];

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some((route) => url.includes(route));
}

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  storage: StorageService,
  authApi: AuthApiService,
  authStore: AuthStore,
): Observable<any> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(addToken(req, token))),
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return from(storage.getRefreshToken()).pipe(
    switchMap((refreshToken) => {
      if (!refreshToken) {
        isRefreshing = false;
        return from(authStore.logout()).pipe(switchMap(() => throwError(() => new Error('No refresh token'))));
      }

      return authApi.refreshToken(refreshToken).pipe(
        switchMap(async (res) => {
          console.log('[JwtInterceptor] Refresh successful');
          isRefreshing = false;
          await storage.setTokens(res.access_token, res.refresh_token);
          authStore.currentUser.set(res.user);
          refreshTokenSubject.next(res.access_token);
          return res.access_token;
        }),
        switchMap((newToken) => next(addToken(req, newToken))),
        catchError((err) => {
          console.error('[JwtInterceptor] Refresh failed:', err);
          isRefreshing = false;
          // On notifie les autres requêtes en attente de l'échec
          refreshTokenSubject.error(err);
          // On réinitialise le sujet pour les futures tentatives (après logout/login)
          refreshTokenSubject = new BehaviorSubject<string | null>(null);
          
          return from(authStore.logout()).pipe(
            switchMap(() => throwError(() => err))
          );
        }),
      );
    }),
  );
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicRoute(req.url)) {
    return next(req);
  }

  const storage = inject(StorageService);
  const authApi = inject(AuthApiService);
  const authStore = inject(AuthStore);

  return from(storage.getAccessToken()).pipe(
    switchMap((token) => {
      const authReq = token ? addToken(req, token) : req;

      return next(authReq).pipe(
        catchError((err) => {
          if (err.status === 401) {
            return handleRefresh(req, next, storage, authApi, authStore);
          }
          return throwError(() => err);
        }),
      );
    }),
  );
};
