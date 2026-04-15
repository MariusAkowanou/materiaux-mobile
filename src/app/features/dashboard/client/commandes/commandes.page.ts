import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { OrderResponse, CreateDisputeDto } from 'src/app/core/services/api/devis/devis.model';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { DisputeModalComponent } from './components/dispute-modal/dispute-modal.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText, IonBadge,
    OrderCardComponent, DisputeModalComponent, PaymentModalComponent,
  ],
  templateUrl: './commandes.page.html',
})
export class CommandesPage implements OnInit {
  private devisStore  = inject(DevisStore);
  private alertCtrl   = inject(AlertController);
  private toastCtrl   = inject(ToastController);

  readonly isLoading    = this.devisStore.isLoading;
  readonly isSubmitting = this.devisStore.isSubmitting;

  readonly activeOrders = computed(() =>
    this.devisStore.myOrders().filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED',
    ),
  );
  readonly completedOrders = computed(() =>
    this.devisStore.myOrders().filter(
      (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED',
    ),
  );

  readonly activeTab      = signal<'active' | 'history'>('active');
  readonly selectedOrder  = signal<OrderResponse | null>(null);
  readonly showDispute    = signal(false);
  readonly showPaydunya   = signal(false);

  ngOnInit() {
    this.devisStore.loadMyOrders();
  }

  async refresh(event: CustomEvent) {
    await this.devisStore.loadMyOrders();
    (event.target as HTMLIonRefresherElement).complete();
  }

  // ── Paiement Moneroo ───────────────────────────────────────────────

  async payWithMoneroo(order: OrderResponse) {
    const alert = await this.alertCtrl.create({
      header: 'Payer avec Moneroo',
      message: `Confirmer le paiement de <strong>${order.total_price.toLocaleString('fr-FR')} FCFA</strong> pour la commande ${order.order_number} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Payer',
          handler: async () => {
            try {
              const result = await this.devisStore.initPaymentMoneroo(order.public_id);
              window.open(result.payment_url, '_blank');
            } catch {
              this.toast('Erreur lors de l\'initialisation du paiement', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── PayDunya push ──────────────────────────────────────────────────

  openPaydunya(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.showPaydunya.set(true);
  }

  async submitPaydunya(phone: string) {
    try {
      await this.devisStore.initPaymentPaydunya(this.selectedOrder()!.public_id, { phone });
      this.showPaydunya.set(false);
      this.toast('Demande de paiement envoyée sur votre téléphone', 'success');
    } catch {
      this.toast('Erreur lors de l\'envoi de la demande', 'danger');
    }
  }

  // ── Litige ─────────────────────────────────────────────────────────

  openDispute(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.showDispute.set(true);
  }

  async submitDispute(dto: CreateDisputeDto) {
    try {
      await this.devisStore.createDispute(this.selectedOrder()!.public_id, dto);
      this.showDispute.set(false);
      this.toast('Litige ouvert avec succès', 'success');
    } catch {
      this.toast('Erreur lors de l\'ouverture du litige', 'danger');
    }
  }

  // ── Clôture ────────────────────────────────────────────────────────

  async closeOrder(order: OrderResponse) {
    const alert = await this.alertCtrl.create({
      header: 'Clôturer la commande',
      message: 'Confirmez-vous la bonne réception ? Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer',
          handler: async () => {
            try {
              await this.devisStore.closeOrder(order.public_id);
              this.toast('Commande clôturée', 'success');
            } catch {
              this.toast('Erreur lors de la clôture', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── PDF ────────────────────────────────────────────────────────────

  downloadPdf(order: OrderResponse) {
    window.open(this.devisStore.getOrderPdfUrl(order.public_id), '_blank');
  }

  // ── Utilitaire ─────────────────────────────────────────────────────

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
