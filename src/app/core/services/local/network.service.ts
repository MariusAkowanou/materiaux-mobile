import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {

  readonly isOnline = signal(true);

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
