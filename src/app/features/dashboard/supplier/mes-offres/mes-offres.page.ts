import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mes-offres',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mes Offres</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content />
  `,
})
export class MesOffresPage {}
