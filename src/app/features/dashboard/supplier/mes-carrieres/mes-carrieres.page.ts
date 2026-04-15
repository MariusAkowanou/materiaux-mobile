import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonFab, IonFabButton,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { MateriauxStore } from 'src/app/core/services/api/materiaux/materiaux.store';
import { Carriere, CarriereCreate, CarriereUpdate } from 'src/app/core/services/api/materiaux/materiaux.model';
import { CarriereCardComponent } from './components/carriere-card/carriere-card.component';
import { CarriereFormModalComponent } from './components/carriere-form-modal/carriere-form-modal.component';

@Component({
  selector: 'app-mes-carrieres',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText,
    IonFab, IonFabButton,
    CarriereCardComponent, CarriereFormModalComponent,
  ],
  templateUrl: './mes-carrieres.page.html',
})
export class MesCarrieresPage implements OnInit {
  private store     = inject(MateriauxStore);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly carrieres    = this.store.mesCarrieres;
  readonly isLoading    = this.store.isLoading;
  readonly isSubmitting = this.store.isSubmitting;

  readonly showForm   = signal(false);
  readonly editTarget = signal<Carriere | null>(null);

  ngOnInit() {
    this.store.loadMesCarrieres();
  }

  async refresh(event: CustomEvent) {
    await this.store.loadMesCarrieres();
    (event.target as HTMLIonRefresherElement).complete();
  }

  openCreate() {
    this.editTarget.set(null);
    this.showForm.set(true);
  }

  openEdit(carriere: Carriere) {
    this.editTarget.set(carriere);
    this.showForm.set(true);
  }

  async submitForm(dto: CarriereCreate | CarriereUpdate) {
    try {
      const target = this.editTarget();
      if (target) {
        await this.store.updateCarriere(target.id, dto as CarriereUpdate);
        this.toast('Carrière mise à jour', 'success');
      } else {
        await this.store.createCarriere(dto as CarriereCreate);
        this.toast('Carrière ajoutée', 'success');
      }
      this.showForm.set(false);
    } catch {
      this.toast('Une erreur est survenue', 'danger');
    }
  }

  async confirmDelete(carriere: Carriere) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer la carrière',
      message: `Supprimer <strong>${carriere.nom}</strong> ? Cette action est irréversible.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.store.deleteCarriere(carriere.id);
              this.toast('Carrière supprimée', 'success');
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
