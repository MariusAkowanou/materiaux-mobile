import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mes-courses',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mes Courses</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content />
  `,
})
export class MesCoursesPage {}
