import { Component, inject, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { NetworkService } from 'src/app/core/services/local/network.service';

@Component({
  selector: 'app-no-connection',
  standalone: true,
  imports: [IonContent, IonSpinner],
  templateUrl: './no-connection.page.html',
})
export class NoConnectionPage {

  private networkService = inject(NetworkService);
  private router         = inject(Router);

  readonly isChecking    = signal(false);
  readonly isRestored    = signal(false);

  constructor() {
    // Dès que la connexion revient, on repart automatiquement
    effect(() => {
      if (this.networkService.isOnline()) {
        this._onConnectionRestored();
      }
    });
  }

  private async _onConnectionRestored(): Promise<void> {
    if (this.isRestored()) return;          // éviter le double déclenchement
    this.isRestored.set(true);

    // Courte pause pour que l'utilisateur voie le message "Connexion rétablie"
    await this._delay(1400);

    const returnUrl = this.networkService.returnUrl() || '/dashboard';
    await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
  }

  /** Bouton "Réessayer" — force une vérification immédiate */
  async retry(): Promise<void> {
    this.isChecking.set(true);
    await this.networkService.checkInitialStatus();
    // Si toujours offline après 2 secondes, on arrête le spinner
    await this._delay(2000);
    this.isChecking.set(false);
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
