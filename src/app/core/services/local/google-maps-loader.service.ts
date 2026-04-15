import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loaded = false;

  load(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Échec du chargement Google Maps'));
      document.head.appendChild(script);
    });
  }
}
