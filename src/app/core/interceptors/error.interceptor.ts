import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/local/toast.service';

function extractPydanticMessage(error: any): string | null {
  const detail = error?.error?.detail;
  if (!detail) return null;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    return first?.msg ?? first?.message ?? null;
  }

  return null;
}

function extractMessage(error: any): string | null {
  return error?.error?.message ?? error?.error?.detail ?? null;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err) => {
      switch (err.status) {
        case 0:
          toast.error('Pas de connexion internet');
          break;

        case 400: {
          const msg = extractMessage(err) ?? 'Requête invalide';
          toast.warning(msg);
          break;
        }

        case 401:
          break;

        case 403:
          toast.error('Accès non autorisé');
          break;

        case 404:
          toast.warning('Ressource introuvable');
          break;

        case 422: {
          const msg = extractPydanticMessage(err) ?? 'Données invalides';
          toast.warning(msg);
          break;
        }

        case 500:
          toast.error('Erreur serveur, réessayez plus tard');
          break;
      }

      return throwError(() => err);
    }),
  );
};
