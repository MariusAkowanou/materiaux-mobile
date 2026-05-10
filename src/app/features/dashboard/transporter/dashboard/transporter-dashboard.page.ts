import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonRefresher, IonRefresherContent, IonSpinner,
  ToastController, IonIcon } from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { OffreDisponible } from 'src/app/core/services/api/transport/transport.model';
import { OffreCardComponent } from './components/offre-card/offre-card.component';
import { ReseauWidgetComponent } from './components/reseau-widget/reseau-widget.component';
import { RejoindreModalComponent } from './components/rejoindre-modal/rejoindre-modal.component';

@Component({
  selector: 'app-transporter-dashboard',
  standalone: true,
  imports: [IonIcon, 
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonToolbar,
    IonRefresher, IonRefresherContent, IonSpinner,
    OffreCardComponent,
    ReseauWidgetComponent,
    RejoindreModalComponent,
  ],
  templateUrl: './transporter-dashboard.page.html',
})
export class TransporterDashboardPage implements OnInit {
  private store     = inject(TransportStore);
  private router    = inject(Router);
  private toastCtrl = inject(ToastController);

  // ── Données du store ──────────────────────────────────────────────────────
  readonly offresEnAttente      = this.store.offresEnAttente;
  readonly mesReseaux           = this.store.mesReseaux;
  readonly isLoading            = this.store.isLoading;
  readonly isSubmitting         = this.store.isSubmitting;
  readonly estDisponible        = this.store.estDisponible;
  readonly monProfil            = this.store.monProfil;
  readonly isLoadingCarrieres   = this.store.isLoadingCarrieres;

  /** Carrières disponibles à rejoindre (actives + non encore affiliées) */
  readonly carrieresPourModal = computed(() => {
    const already = this.store.reseauxIds();
    return this.store.carrieresDisponibles().filter(
      (c) => c.est_active && !already.has(c.id),
    );
  });

  // ── État UI local ─────────────────────────────────────────────────────────
  readonly showRejoindreModal = signal(false);

  // ── Cycle de vie ──────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.store.loadOffresDisponibles(),
      this.store.loadMesReseaux(),
      this.store.loadMonProfil(),
    ]);
  }

  // ── Pull-to-refresh ───────────────────────────────────────────────────────

  async handleRefresh(event: any): Promise<void> {
    await Promise.all([
      this.store.loadOffresDisponibles(),
    ]);
    event.target.complete();
  }

  // ── Offres disponibles ────────────────────────────────────────────────────

  async accepterOffre(offre: OffreDisponible): Promise<void> {
    const result = await this.store.accepterCourse(offre.order_id);
    if (result.success) {
      await this.toast('Course acceptée ! Bonne route ', 'success');
    } else if (result.taken) {
      await this.toast('Cette course a déjà été prise par un autre transporteur', 'warning');
    } else {
      await this.toast(result.message || 'Erreur lors de l\'acceptation', 'danger');
    }
  }

  voirDetailOffre(offre: OffreDisponible): void {
    this.router.navigate(['/dashboard/transporter/courses', offre.order_id]);
  }

  // ── Réseaux ───────────────────────────────────────────────────────────────

  async openRejoindreModal(): Promise<void> {
    this.showRejoindreModal.set(true);
    await this.store.loadCarrieresDisponibles();
  }

  async confirmerRejoindre(ids: number[]): Promise<void> {
    try {
      await this.store.rejoindrMultiple(ids);
      this.showRejoindreModal.set(false);
      const n = ids.length;
      await this.toast(
        n === 1 ? 'Réseau rejoint !' : `${n} réseaux rejoints !`,
        'success',
      );
    } catch {
      await this.toast('Erreur lors de l\'adhésion', 'danger');
    }
  }

  async quitterReseau(carriereId: number): Promise<void> {
    try {
      await this.store.quitterReseau(carriereId);
      await this.toast('Réseau quitté', 'warning');
    } catch {
      await this.toast('Impossible de quitter ce réseau', 'danger');
    }
  }

  voirTousReseaux(): void {
    this.router.navigate(['/dashboard/transporter/mes-reseaux']);
  }

  // ── Disponibilité ─────────────────────────────────────────────────────────

  async toggleDisponibilite(): Promise<void> {
    const actuel = this.estDisponible();
    try {
      await this.store.updateDisponibilite(!actuel);
      await this.toast(
        !actuel ? 'Vous êtes maintenant disponible' : 'Vous êtes maintenant indisponible',
        !actuel ? 'success' : 'medium',
      );
    } catch {
      await this.toast('Erreur lors de la mise à jour', 'danger');
    }
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      color,
      duration: 3000,
      position: 'top',
    });
    await t.present();
  }
}
