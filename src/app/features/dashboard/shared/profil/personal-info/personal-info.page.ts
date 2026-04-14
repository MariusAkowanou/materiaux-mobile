import { Component } from '@angular/core';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton
  ],
  templateUrl: './personal-info.page.html',
})
export class PersonalInfoPage {}
