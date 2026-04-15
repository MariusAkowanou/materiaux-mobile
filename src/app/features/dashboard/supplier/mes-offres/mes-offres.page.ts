import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonFab, IonFabButton, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { MateriauxStore } from 'src/app/core/services/api/materiaux/materiaux.store';
import { CatalogueStore } from 'src/app/core/services/api/catalogue/catalogue.store';
import {
  OffreFournisseur, OffreFournisseurCreate, OffreFournisseurUpdate, OffreStatut,
} from 'src/app/core/services/api/materiaux/materiaux.model';
import { OffreCardComponent } from './components/offre-card/offre-card.component';
import { OffreFormModalComponent } from './components/offre-form-modal/offre-form-modal.component';

@Component({
  selector: 'app-mes-offres',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText,
    IonFab, IonFabButton, IonBadge,
    OffreCardComponent, OffreFormModalComponent,
  ],
  templateUrl: './mes-offres.page.html',
})
export class MesOffresPage implements OnInit {
  private store          = inject(MateriauxStore);
  private catalogueStore = inject(CatalogueStore);
  private alertCtrl      = inject(AlertController);
  private toastCtrl      = inject(ToastController);

  readonly offres       = this.store.mesOffres;
  readonly carrieres    = this.store.mesCarrieres;
  readonly camionTypes  = this.store.camionTypes;
  readonly materiaux    = this.catalogueStore.materiaux;
  readonly isLoading    = this.store.isLoading;
  readonly isSubmitting = this.store.isSubmitting;

  // Onglets par statut
  readonly activeTab = signal<'ACTIVE' | 'EN_RUPTURE' | 'ARCHIVEE'>('ACTIVE');

  readonly filteredOffres = computed(() =>
    this.offres().filter((o) => o.statut === this.activeTab()),
  );

  readonly countByStatut = computed(() => ({
    ACTIVE:     this.offres().filter((o) => o.statut === 'ACTIVE').length,
    EN_RUPTURE: this.offres().filter((o) => o.statut === 'EN_RUPTURE').length,
    ARCHIVEE:   this.offres().filter((o) => o.statut === 'ARCHIVEE').length,
  }));

  readonly showForm   = signal(false);
  readonly editTarget = signal<OffreFournisseur | null>(null);

  readonly tabs: { key: OffreStatut; label: string }[] = [
    { key: 'ACTIVE',     label: 'Actives'    },
    { key: 'EN_RUPTURE', label: 'En rupture' },
    { key: 'ARCHIVEE',   label: 'Archivées'  },
  ];

  ngOnInit() {
    this.store.loadMesOffres();
    this.store.loadMesCarrieres();
    this.store.loadCamionTypes();
    this.catalogueStore.loadMateriaux();
  }

  async refresh(event: CustomEvent) {
    await Promise.all([
      this.store.loadMesOffres(),
      this.store.loadMesCarrieres(),
    ]);
    (event.target as HTMLIonRefresherElement).complete();
  }

  openCreate() {
    this.editTarget.set(null);
    this.showForm.set(true);
  }

  openEdit(offre: OffreFournisseur) {
    this.editTarget.set(offre);
    this.showForm.set(true);
  }

  async submitForm(dto: OffreFournisseurCreate | OffreFournisseurUpdate) {
    try {
      const target = this.editTarget();
      if (target) {
        await this.store.updateOffre(target.id, dto as OffreFournisseurUpdate);
        this.toast('Offre mise à jour', 'success');
      } else {
        await this.store.createOffre(dto as OffreFournisseurCreate);
        this.toast('Offre publiée avec succès', 'success');
      }
      this.showForm.set(false);
    } catch {
      this.toast('Une erreur est survenue', 'danger');
    }
  }

  async toggleStatut(offre: OffreFournisseur, statut: OffreStatut) {
    try {
      await this.store.updateOffreStatut(offre.id, statut);
      const label = statut === 'ACTIVE' ? 'remise en vente' : 'mise en rupture';
      this.toast(`Offre ${label}`, 'success');
    } catch {
      this.toast('Erreur lors du changement de statut', 'danger');
    }
  }

  async confirmDelete(offre: OffreFournisseur) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer l\'offre',
      message: `Supprimer l'offre de <strong>${offre.materiau_nom}</strong> ? Cette action est irréversible.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.store.deleteOffre(offre.id);
              this.toast('Offre supprimée', 'success');
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
