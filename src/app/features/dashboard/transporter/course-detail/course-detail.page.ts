import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { TransportApiService } from 'src/app/core/services/api/transport/transport.api.service';
import { AuthStore } from 'src/app/core/services/api/auth/auth.store';
import { MissionTransporteur } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ],
  templateUrl: './course-detail.page.html',
})
export class CourseDetailPage implements OnInit {
  private store     = inject(TransportStore);
  private api       = inject(TransportApiService);
  private authStore = inject(AuthStore);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  // ── État ──────────────────────────────────────────────────────────────────
  readonly mission    = signal<MissionTransporteur | null>(null);
  readonly isLoading  = signal(true);
  readonly isStarting = signal(false);

  // ── Rôle ──────────────────────────────────────────────────────────────────
  readonly isSupplier     = computed(() => this.authStore.primaryRole() === 'SUPPLIER');
  readonly isTransporter  = computed(() => this.authStore.primaryRole() === 'TRANSPORTER');

  // ── Transport cost ────────────────────────────────────────────────────────
  /** Vrai si le transport est inclus dans le prix matériaux (0 FCFA séparé) */
  readonly transportCostZero = computed(() => {
    const tc = this.mission()?.quote_summary?.transport_cost;
    return !tc || parseFloat(tc) === 0;
  });

  // ── Computed helpers ──────────────────────────────────────────────────────
  readonly isInTransit = computed(() => this.mission()?.status === 'IN_PROGRESS');
  readonly isDelivered = computed(() =>
    ['DELIVERED', 'COMPLETED'].includes(this.mission()?.status ?? ''),
  );
  readonly isCancelled = computed(() => this.mission()?.status === 'CANCELLED');

  /**
   * "Démarrer la course" :
   *  - Visible quand transport_cost === "0.00" (le fournisseur/transporteur
   *    gère lui-même la livraison sans transporteur externe)
   *  - Et que la commande est dans un état démarrable (ASSIGNED ou CONFIRMED)
   */
  readonly canStart = computed(() => {
    const status = this.mission()?.status ?? '';
    const startable = status === 'ASSIGNED' || status === 'CONFIRMED';
    return this.transportCostZero() && startable;
  });

  // ── Cycle de vie ──────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    await this.loadMission(id);
  }

  private async loadMission(publicId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      // Cherche d'abord dans les missions déjà en mémoire
      const cached = this.store.mesMissions().find((m) => m.public_id === publicId);
      if (cached) {
        this.mission.set(cached);
        return;
      }
      // Sinon appel API
      const m = await firstValueFrom(this.api.getMissionByPublicId(publicId));
      this.mission.set(m);
    } catch {
      this.mission.set(null);
      await this.toast('Impossible de charger cette mission', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Démarrer la livraison (avec capture GPS) ──────────────────────────────

  async demarrerLivraison(): Promise<void> {
    const m = this.mission();
    if (!m) return;

    const alert = await this.alertCtrl.create({
      header: 'Démarrer la livraison',
      message: 'Votre position GPS sera utilisée comme point de départ pour tracer l\'itinéraire.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Démarrer', handler: () => { this._executerDemarrage(m); } },
      ],
    });
    await alert.present();
  }

  private async _executerDemarrage(m: MissionTransporteur): Promise<void> {
    this.isStarting.set(true);
    try {
      // 1. Capture GPS
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // 2. Appel API → démarrage livraison
      await this.store.demarrerLivraison(m.public_id);

      // 3. Mise à jour locale de la mission
      this.mission.update((prev) =>
        prev ? { ...prev, status: 'IN_PROGRESS' as const } : prev,
      );

      await this.toast('Livraison démarrée ! Bonne route 🚛', 'success');

      // 4. Navigation vers la carte avec les coordonnées GPS
      this.router.navigate(
        ['/dashboard/transporter/courses', m.public_id, 'map'],
        { queryParams: { lat, lng } },
      );
    } catch (err: any) {
      const isPermission =
        err?.message?.toLowerCase().includes('denied') ||
        err?.message?.toLowerCase().includes('permission');
      await this.toast(
        isPermission
          ? 'Activez la géolocalisation pour démarrer'
          : 'Erreur lors du démarrage de la livraison',
        'warning',
      );
    } finally {
      this.isStarting.set(false);
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  ouvrirCarte(): void {
    const m = this.mission();
    if (!m) return;
    this.router.navigate(['/dashboard/transporter/courses', m.public_id, 'map']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statutLabel(status: string): string {
    const labels: Record<string, string> = {
      ASSIGNED:            'Assignée',
      IN_PROGRESS:         'En route',
      PARTIALLY_DELIVERED: 'Part. livrée',
      DELIVERED:           'Livrée',
      COMPLETED:           'Terminée',
      CANCELLED:           'Annulée',
    };
    return labels[status] ?? status;
  }

  statutColor(status: string): string {
    const colors: Record<string, string> = {
      ASSIGNED:            '#f97316',
      IN_PROGRESS:         '#3b82f6',
      PARTIALLY_DELIVERED: '#a855f7',
      DELIVERED:           '#22c55e',
      COMPLETED:           '#16a34a',
      CANCELLED:           '#ef4444',
    };
    return colors[status] ?? '#6b7280';
  }

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3500, position: 'top' });
    await t.present();
  }
}
