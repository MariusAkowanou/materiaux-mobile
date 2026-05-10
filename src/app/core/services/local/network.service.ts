import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {

  /** Vrai si l'appareil est connecté à internet */
  readonly isOnline = signal(true);

  /** URL à restaurer quand la connexion revient */
  readonly returnUrl = signal('/dashboard');

  constructor() {
    this.checkInitialStatus();

    Network.addListener('networkStatusChange', (status) => {
      this.isOnline.set(status.connected);
    });
  }

  async checkInitialStatus(): Promise<void> {
    const status = await Network.getStatus();
    this.isOnline.set(status.connected);
  }
}
