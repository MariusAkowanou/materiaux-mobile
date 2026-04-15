import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

/**
 * AuthShellComponent — Layout minimal pour les pages d'authentification.
 * Pas de tabs, pas de header — juste un conteneur centré pour login, register, verify-otp.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [IonRouterOutlet],
  template: `
    <ion-router-outlet />
  `,
})
export class AuthShellComponent {}
