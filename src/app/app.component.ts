import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthStore } from './core/services/api/auth/auth.store';
import { NetworkService } from './core/services/local/network.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private networkService: NetworkService,
    private authStore: AuthStore,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.networkService.checkInitialStatus();
      await this.authStore.loadCurrentUser();
    } catch {
      // Erreurs silencieuses — l'état des signals reste correct
    }

    // Redirige seulement si on est bloqué sur le splash ou à la racine
    if (this.router.url === '/' || this.router.url.startsWith('/splash')) {
      if (this.authStore.isLoggedIn()) {
        await this.router.navigate(['/dashboard/home'], { replaceUrl: true });
      } else {
        await this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    }

    // Nécessite : npm install @capacitor/splash-screen
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const splashModule = await import('@capacitor/splash-screen').catch(() => null);
    if (splashModule) {
      await splashModule.SplashScreen.hide({ fadeOutDuration: 300 });
    }
  }
}
