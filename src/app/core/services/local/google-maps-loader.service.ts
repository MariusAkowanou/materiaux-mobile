import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * Charge le SDK Google Maps de façon lazy — une seule fois, à la demande.
 * Les pages qui n'utilisent pas la carte ne chargent jamais ce script.
 *
 * Usage :
 *   await this.mapsLoader.load();
 *   // google.maps est maintenant disponible
 */
@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {

  private loadPromise: Promise<void> | null = null;

  /**
   * Retourne une Promise qui se résout quand `window.google.maps` est prêt.
   * Peut être appelé plusieurs fois sans risque — le script n'est injecté qu'une seule fois.
   */
  load(): Promise<void> {
    // Déjà disponible en mémoire
    if (this.isLoaded) {
      return Promise.resolve();
    }

    // Chargement déjà en cours → retourner la même promesse
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const callbackName = '__googleMapsReady__';

      // Le SDK appelle ce callback quand il est totalement initialisé
      (window as any)[callbackName] = () => {
        delete (window as any)[callbackName];
        resolve();
      };

      const key = environment.googleMapsApiKey;
      const script = document.createElement('script');
      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${key}` +
        `&libraries=places,geometry` +
        `&language=fr` +
        `&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        this.loadPromise = null; // Permettre une nouvelle tentative
        delete (window as any)[callbackName];
        reject(new Error('Échec du chargement Google Maps'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /** Vrai si le SDK est déjà disponible en mémoire */
  get isLoaded(): boolean {
    return typeof (window as any)['google'] !== 'undefined'
        && !!(window as any)['google']?.maps;
  }
}
