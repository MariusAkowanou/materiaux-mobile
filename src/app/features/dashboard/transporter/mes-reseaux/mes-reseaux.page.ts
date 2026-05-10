import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';

@Component({
  selector: 'app-mes-reseaux',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ],
  templateUrl: './mes-reseaux.page.html',
})
export class MesReseauxPage implements OnInit {
  private store     = inject(TransportStore);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  readonly mesReseaux          = this.store.mesReseaux;
  readonly isLoading           = this.store.isLoading;
  readonly isSubmitting        = this.store.isSubmitting;
  readonly isLoadingCarrieres  = this.store.isLoadingCarrieres;

  // ── Modal ────────────────────────────────────────────────────────────────
  readonly showModal    = signal(false);
  readonly searchQuery  = signal('');
  readonly selectedIds  = signal<Set<number>>(new Set());
  readonly selectedCount = computed(() => this.selectedIds().size);

  /**
   * Carrières disponibles pour rejoindre :
   *   - est_active === true  (champ correct retourné par l'API)
   *   - pas encore affiliée
   */
  readonly filteredCarrieres = computed(() => {
    const q      = this.searchQuery().trim().toLowerCase();
    const already = this.store.reseauxIds();
    return this.store.carrieresDisponibles()
      .filter((c) => c.est_active && !already.has(c.id))
      .filter((c) =>
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.adresse_texte?.toLowerCase().includes(q),
      );
  });

  async ngOnInit(): Promise<void> {
    if (!this.mesReseaux().length) {
      await this.store.loadMesReseaux();
    }
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  async openModal(): Promise<void> {
    this.selectedIds.set(new Set());
    this.searchQuery.set('');
    this.showModal.set(true);
    await this.store.loadCarrieresDisponibles();
  }

  toggleSelection(carriereId: number): void {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(carriereId)) next.delete(carriereId);
      else next.add(carriereId);
      return next;
    });
  }

  isSelected(carriereId: number): boolean {
    return this.selectedIds().has(carriereId);
  }

  async confirmerRejoindre(): Promise<void> {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    try {
      await this.store.rejoindrMultiple(ids);
      const n = ids.length;
      this.showModal.set(false);
      this.selectedIds.set(new Set());
      await this.toast(
        n === 1 ? 'Réseau rejoint !' : `${n} réseaux rejoints !`,
        'success',
      );
    } catch {
      await this.toast('Erreur lors de l\'adhésion', 'danger');
    }
  }

  // ── Quitter ───────────────────────────────────────────────────────────────

  async quitterReseau(carriereId: number, nom: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Quitter le réseau',
      message: `Vous ne recevrez plus de commandes de ${nom}.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.store.quitterReseau(carriereId);
              await this.toast('Réseau quitté', 'warning');
            } catch {
              await this.toast('Erreur lors de la sortie du réseau', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
