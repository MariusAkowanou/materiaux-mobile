import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonSkeletonText, IonSpinner,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { OrderResponse } from 'src/app/core/services/api/devis/devis.model';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { DisputeModalComponent } from './components/dispute-modal/dispute-modal.component';
import { CreateDisputeDto } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-commandes-detail',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, DatePipe,
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton,
    IonSkeletonText, IonSpinner,
    PaymentModalComponent, DisputeModalComponent,
  ],
  templateUrl: './commandes-detail.page.html',
})
export class CommandesDetailPage implements OnInit {
  private devisStore  = inject(DevisStore);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private alertCtrl   = inject(AlertController);
  private toastCtrl   = inject(ToastController);

  readonly order       = this.devisStore.currentOrder;
  readonly isLoading   = this.devisStore.isLoading;
  readonly isProcessing = signal(false);
  readonly showPayment  = signal(false);
  readonly showDispute  = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/dashboard/client/commandes']); return; }
    await this.devisStore.loadOrder(id);
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  num(v: string | number | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? parseFloat(v) : v;
  }

  get canPay():    boolean { const o = this.order(); return !!o && !o.is_paid  }
  get canCancel(): boolean { const o = this.order(); return !!o && ['CONFIRMED','PENDING_PAYMENT'].includes(o.status); }
  get canClose():  boolean { const o = this.order(); return !!o && ['PARTIALLY_DELIVERED','DELIVERED'].includes(o.status); }
  get canDispute():boolean { const o = this.order(); return !!o && ['IN_PROGRESS','PARTIALLY_DELIVERED','DELIVERED'].includes(o.status); }

  statusCfg(status: string): { label: string; bg: string; color: string; icon: string } {
    const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      CONFIRMED:                 { label: 'En attente',             bg: '#fff7ed', color: '#f97316', icon: 'pi-clock' },
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

  // ── Paiement ─────────────────────────────────────────────────────────
  async payWithMoneroo(order: OrderResponse): Promise<void> {
    this.isProcessing.set(true);
    try {
      const result = await this.devisStore.initPaymentMoneroo(order.public_id, {});
      const checkoutUrl = result.checkout_url ?? result.payment_url;
      if (!checkoutUrl) {
        throw new Error('URL de paiement Moneroo absente');
      }
      this.showPayment.set(false);
      await this.openPaymentCheckout(checkoutUrl);
      const h = await App.addListener('resume', async () => {
        await this.devisStore.loadOrder(order.public_id);
        h.remove();
      });
    } catch {
      this.toast('Erreur lors de l\'initialisation du paiement', 'danger');
    } finally {
      this.isProcessing.set(false);
    }
  }

  async submitPaydunya(phone: string): Promise<void> {
    const o = this.order();
    if (!o) return;
    this.isProcessing.set(true);
    try {
      await this.devisStore.initPaymentPaydunya(o.public_id, { phone });
      this.showPayment.set(false);
      this.toast('Demande de paiement envoyée sur votre téléphone', 'success');
    } catch {
      this.toast('Erreur lors de l\'envoi', 'danger');
    } finally {
      this.isProcessing.set(false);
    }
  }

  // ── Annuler ──────────────────────────────────────────────────────────
  async cancelOrder(): Promise<void> {
    const o = this.order();
    if (!o) return;
    const alert = await this.alertCtrl.create({
      header: 'Annuler la commande',
      message: `Annuler la commande <strong>${o.order_number}</strong> ? Cette action est irréversible.`,
      buttons: [
        { text: 'Retour', role: 'cancel' },
        {
          text: 'Confirmer l\'annulation',
          role: 'destructive',
          handler: async () => {
            this.isProcessing.set(true);
            try {
              await this.devisStore.cancelOrder(o.public_id);
              this.toast('Commande annulée', 'warning');
              this.router.navigate(['/dashboard/client/commandes']);
            } catch {
              this.toast('Erreur lors de l\'annulation', 'danger');
            } finally {
              this.isProcessing.set(false);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Clôturer ─────────────────────────────────────────────────────────
  async closeOrder(): Promise<void> {
    const o = this.order();
    if (!o) return;
    const alert = await this.alertCtrl.create({
      header: 'Clôturer la commande',
      message: 'Confirmez-vous la bonne réception de votre commande ? Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer la réception',
          handler: async () => {
            this.isProcessing.set(true);
            try {
              await this.devisStore.closeOrder(o.public_id);
              this.toast('Commande clôturée avec succès', 'success');
              await this.devisStore.loadOrder(o.public_id);
            } catch {
              this.toast('Erreur lors de la clôture', 'danger');
            } finally {
              this.isProcessing.set(false);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Litige ────────────────────────────────────────────────────────────
  async submitDispute(dto: CreateDisputeDto): Promise<void> {
    const o = this.order();
    if (!o) return;
    try {
      await this.devisStore.createDispute(o.public_id, dto);
      this.showDispute.set(false);
      this.toast('Litige ouvert avec succès', 'success');
    } catch {
      this.toast('Erreur lors de l\'ouverture du litige', 'danger');
    }
  }

  downloadPdf(): void {
    const o = this.order();
    if (o) Browser.open({ url: this.devisStore.getOrderPdfUrl(o.public_id) });
  }

  private async openPaymentCheckout(url: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    }

    window.location.assign(url);
  }

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
