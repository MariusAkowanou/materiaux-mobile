import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Fournisseur</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content />
  `,
})
export class SupplierDashboardPage {}
