import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-transporter-dashboard.page',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Transporteur</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:1rem;">
        <i class="pi pi-clock" style="font-size:3rem;color:var(--ion-color-medium);"></i>
        <p style="color:var(--ion-color-medium);text-align:center;margin:0;">
          <strong>Dashboard Transporteur</strong><br>En cours de développement
        </p>
      </div>
    </ion-content>
  `,
})
export class TransporterDashboardPage {}
