import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NetworkService } from './core/services/local/network.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private networkService = inject(NetworkService);
  private router         = inject(Router);

  /** Empêche la redirection lors du tout premier run de l'effect */
  private initialized = false;

  constructor() {
    effect(() => {
      const online = this.networkService.isOnline();

      if (!this.initialized) {
        this.initialized = true;
        // App démarrée sans connexion → aller directement sur no-connection
        if (!online) {
          this.networkService.returnUrl.set('/dashboard');
          this.router.navigateByUrl('/no-connection', { replaceUrl: true });
        }
        return;
      }

      // Connexion perdue en cours d'utilisation
      if (!online) {
        const current = this.router.url;
        if (!current.includes('/no-connection')) {
          this.networkService.returnUrl.set(current || '/dashboard');
        }
        this.router.navigateByUrl('/no-connection', { replaceUrl: true });
      }
    });
  }
}
