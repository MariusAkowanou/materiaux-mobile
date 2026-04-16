import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonFab, IonFabButton,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { Tarif, TarifCreate } from 'src/app/core/services/api/transport/transport.model';
import { TarifCardComponent } from './components/tarif-card/tarif-card.component';
import { TarifFormModalComponent } from './components/tarif-form-modal/tarif-form-modal.component';

@Component({
  selector: 'app-mes-tarifs',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText,
    IonFab, IonFabButton,
    TarifCardComponent, TarifFormModalComponent,
  ],
  templateUrl: './mes-tarifs.page.html',
})
export class MesTarifsPage implements OnInit {
  private store      = inject(TransportStore);
  private alertCtrl  = inject(AlertController);
  private toastCtrl  = inject(ToastController);

  readonly tarifs       = this.store.mesTarifs;
  readonly camions      = this.store.camionsSorted;
  readonly isLoading    = this.store.isLoading;
  readonly isSubmitting = this.store.isSubmitting;

  readonly showForm = signal(false);

  ngOnInit() {
    this.store.loadMesTarifs();
    this.store.loadCamions();
  }

  async refresh(event: CustomEvent) {
    await this.store.loadMesTarifs();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async submitForm(dto: TarifCreate) {
    try {
      await this.store.createTarif(dto);
      this.showForm.set(false);
      this.toast('Tarif créé avec succès', 'success');
    } catch {
      this.toast('Une erreur est survenue', 'danger');
    }
  }

  async confirmDelete(tarif: Tarif) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le tarif',
      message: `Supprimer le tarif pour <strong>${tarif.camion_libelle}</strong> ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.store.deleteTarif(tarif.id);
              this.toast('Tarif supprimé', 'success');
            } catch {
              this.toast('Erreur lors de la suppression', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
