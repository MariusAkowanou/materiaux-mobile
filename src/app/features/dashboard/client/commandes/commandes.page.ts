import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent,
  AlertController, ToastController,
  IonModal, IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
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
    IonContent, IonHeader, IonToolbar,
    IonRefresher, IonRefresherContent,
    OrderCardComponent, DisputeModalComponent, PaymentModalComponent,
  ],
  templateUrl: './commandes.page.html',
})
export class CommandesPage implements OnInit {
  private devisStore = inject(DevisStore);
  private router     = inject(Router);
  private alertCtrl  = inject(AlertController);
  private toastCtrl  = inject(ToastController);

  readonly isLoading       = this.devisStore.isLoading;
  readonly activeTab       = signal<'active' | 'history'>('active');
  readonly selectedOrder   = signal<OrderResponse | null>(null);
  readonly showPayment     = signal(false);
  readonly showDispute     = signal(false);
  readonly processingOrderId = signal<string | null>(null);

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

  ngOnInit(): void {
    this.devisStore.loadMyOrders();
  }

  async refresh(event: CustomEvent): Promise<void> {
    await this.devisStore.loadMyOrders();
    (event.target as HTMLIonRefresherElement).complete();
  }

  // ── Navigation détail ─────────────────────────────────────────────

  goToDetail(order: OrderResponse): void {
    this.router.navigate(['/dashboard/client/commandes', order.public_id]);
  }

  // ── Ouvrir le modal paiement ───────────────────────────────────────

  openPayment(order: OrderResponse): void {
    this.selectedOrder.set(order);
    this.showPayment.set(true);
  }

  // ── Paiement Moneroo ───────────────────────────────────────────────

  async payWithMoneroo(order: OrderResponse): Promise<void> {
    this.processingOrderId.set(order.public_id);
    try {
      const result = await this.devisStore.initPaymentMoneroo(order.public_id, {});
      const checkoutUrl = result.checkout_url ?? result.payment_url;
      if (!checkoutUrl) {
        throw new Error('URL de paiement Moneroo absente');
      }
      this.showPayment.set(false);

      await this.openPaymentCheckout(checkoutUrl);

      // Quand l'utilisateur revient dans l'app, rafraîchir les commandes
      const resumeHandle = await App.addListener('resume', async () => {
        await this.devisStore.loadMyOrders();
        resumeHandle.remove();
      });
    } catch {
      this.toast('Erreur lors de l\'initialisation du paiement', 'danger');
    } finally {
      this.processingOrderId.set(null);
    }
  }

  // ── Paiement PayDunya push ─────────────────────────────────────────

  async submitPaydunya(phone: string): Promise<void> {
    const order = this.selectedOrder();
    if (!order) return;
    this.processingOrderId.set(order.public_id);
    try {
      await this.devisStore.initPaymentPaydunya(order.public_id, { phone });
      this.showPayment.set(false);
      this.toast('Demande de paiement envoyée sur votre téléphone', 'success');
    } catch {
      this.toast('Erreur lors de l\'envoi de la demande', 'danger');
    } finally {
      this.processingOrderId.set(null);
    }
  }

  // ── Annuler une commande ───────────────────────────────────────────

  async cancelOrder(order: OrderResponse): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Annuler la commande',
      message: `Confirmer l'annulation de la commande <strong>${order.order_number}</strong> ?`,
      buttons: [
        { text: 'Retour', role: 'cancel' },
        {
          text: 'Annuler la commande',
          role: 'destructive',
          handler: async () => {
            this.processingOrderId.set(order.public_id);
            try {
              await this.devisStore.cancelOrder(order.public_id);
              this.toast('Commande annulée', 'warning');
            } catch {
              this.toast('Erreur lors de l\'annulation', 'danger');
            } finally {
              this.processingOrderId.set(null);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Litige ─────────────────────────────────────────────────────────

  openDisputeFor(order: OrderResponse): void {
    this.selectedOrder.set(order);
    this.showDispute.set(true);
  }

  async submitDispute(dto: CreateDisputeDto): Promise<void> {
    const order = this.selectedOrder();
    if (!order) return;
    try {
      await this.devisStore.createDispute(order.public_id, dto);
      this.showDispute.set(false);
      this.toast('Litige ouvert avec succès', 'success');
    } catch {
      this.toast('Erreur lors de l\'ouverture du litige', 'danger');
    }
  }

  // ── Clôturer ────────────────────────────────────────────────────────

  async closeOrder(order: OrderResponse): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Clôturer la commande',
      message: 'Confirmez-vous la bonne réception ? Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer la réception',
          handler: async () => {
            this.processingOrderId.set(order.public_id);
            try {
              await this.devisStore.closeOrder(order.public_id);
              this.toast('Commande clôturée avec succès', 'success');
            } catch {
              this.toast('Erreur lors de la clôture', 'danger');
            } finally {
              this.processingOrderId.set(null);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── PDF ─────────────────────────────────────────────────────────────

  downloadPdf(order: OrderResponse): void {
    Browser.open({ url: this.devisStore.getOrderPdfUrl(order.public_id) });
  }

  private async openPaymentCheckout(url: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // iOS/Android: ouvrir dans le navigateur embarqué.
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    }

    // Web (ionic serve): éviter le blocage popup en naviguant dans l'onglet courant.
    window.location.assign(url);
  }

  // ── Utilitaire ──────────────────────────────────────────────────────

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
