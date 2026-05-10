import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton,
  IonSpinner,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';

@Component({
  selector: 'app-supplier-order-detail',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, DatePipe,
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton,
    IonSpinner,
  ],
  templateUrl: './supplier-order-detail.page.html',
})
export class SupplierOrderDetailPage implements OnInit {
  private devisStore    = inject(DevisStore);
  private transportStore = inject(TransportStore);
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private toastCtrl     = inject(ToastController);
  private alertCtrl     = inject(AlertController);

  readonly order        = this.devisStore.currentOrder;
  readonly isLoading    = this.devisStore.isLoading;
  readonly isProcessing = signal(false);
  readonly isStarting   = signal(false);

  /** Vrai si le transport est à 0 (fournisseur gère la livraison lui-même) */
  readonly transportCostZero = computed(() => {
    const tc = this.order()?.quote_summary?.transport_cost;
    return !tc || parseFloat(tc) === 0;
  });

  /** "Démarrer la course" : transport inclus ET statut démarrable */
  readonly canStart = computed(() => {
    const status = this.order()?.status ?? '';
    const startable = ['CONFIRMED', 'PAID_AWAITING_DISPATCH', 'ASSIGNED'].includes(status);
    return this.transportCostZero() && startable;
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/dashboard/supplier/home']); return; }
    await this.devisStore.loadOrder(id);
  }

  // ── Helpers ──────────────────────────────────────────────────────
  num(v: string | number | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? parseFloat(v) : v;
  }

  get canDispatch(): boolean {
    const o = this.order();
    return !!o && o.status === 'DELIVERED'&& this.transportCostZero() ;
  }

  statusCfg(status: string): { label: string; bg: string; color: string; icon: string } {
    const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      CONFIRMED:                 { label: 'En attente', bg: '#fff7ed', color: '#f97316', icon: 'pi-clock' },
      ASSIGNED:                  { label: 'Assigné',                bg: '#eff6ff', color: '#3b82f6', icon: 'pi-user' },
      IN_PROGRESS:                { label: 'En transit',             bg: '#ecfeff', color: '#0891b2', icon: 'pi-truck' },
      DELIVERED:                 { label: 'Livré',                  bg: '#f0fdf4', color: '#16a34a', icon: 'pi-check-circle' },
      CANCELLED:                 { label: 'Annulé',                 bg: '#fef2f2', color: '#dc2626', icon: 'pi-times-circle' },
    };
    return map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280', icon: 'pi-info-circle' };
  }

  speedLabel(s: string): string {
    return ({ NORMAL: 'Standard (3–5 j)', RAPIDE: 'Rapide (24–48 h)', ULTRA_RAPIDE: 'Express (même jour)' } as any)[s] ?? s;
  }

  // ── Actions ──────────────────────────────────────────────────────

  async markAsDispatched(): Promise<void> {
    const o = this.order();
    if (!o) return;
    const alert = await this.alertCtrl.create({
      header: 'Confirmer l\'expédition',
      message: `Marquer la commande <strong>${o.order_number}</strong> comme expédiée vers le transporteur ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer',
          handler: async () => {
            this.isProcessing.set(true);
            try {
              await this.devisStore.updateOrderStatus(o.public_id, { status: 'DISPATCHED_TO_TRANSPORTER' });
              await this.devisStore.loadOrder(o.public_id);
              this.toast('Commande marquée comme expédiée', 'success');
            } catch {
              this.toast('Erreur lors de la mise à jour du statut', 'danger');
            } finally {
              this.isProcessing.set(false);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Démarrer la course (transport inclus à 0 FCFA) ───────────────

  async demarrerCourse(): Promise<void> {
    const o = this.order();
    if (!o) return;

    const alert = await this.alertCtrl.create({
      header: 'Démarrer la livraison',
      message: 'Votre position GPS sera capturée comme point de départ.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Démarrer', handler: () => { this._executerDemarrage(o); } },
      ],
    });
    await alert.present();
  }

  private async _executerDemarrage(o: any): Promise<void> {
    this.isStarting.set(true);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      await this.transportStore.demarrerLivraison(o.public_id);

      await this.toast('Livraison démarrée ! Bonne route 🚛', 'success');

      this.router.navigate(
        ['/dashboard/supplier/commandes', o.public_id, 'map'],
        { queryParams: { lat, lng } },
      );
    } catch (err: any) {
      const denied =
        err?.message?.toLowerCase().includes('denied') ||
        err?.message?.toLowerCase().includes('permission');
      await this.toast(
        denied
          ? 'Activez la géolocalisation pour démarrer'
          : 'Erreur lors du démarrage',
        'warning',
      );
    } finally {
      this.isStarting.set(false);
    }
  }

  // ── Voir l'itinéraire ─────────────────────────────────────────────

  voirItineraire(): void {
    const o = this.order();
    if (!o) return;
    this.router.navigate(['/dashboard/supplier/commandes', o.public_id, 'map']);
  }

  downloadPdf(): void {
    const o = this.order();
    if (o) Browser.open({ url: this.devisStore.getOrderPdfUrl(o.public_id) });
  }

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  } 
}
