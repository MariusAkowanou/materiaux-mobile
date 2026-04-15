import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard, IonCardContent, IonBadge, IonButton, IonProgressBar,
} from '@ionic/angular/standalone';
import { OrderResponse, OrderStatus } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonCard, IonCardContent, IonBadge, IonButton, IonProgressBar],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  @Input({ required: true }) order!: OrderResponse;
  @Input() isSubmitting = false;

  @Output() onPay        = new EventEmitter<OrderResponse>();
  @Output() onPaydunya   = new EventEmitter<OrderResponse>();
  @Output() onDispute    = new EventEmitter<OrderResponse>();
  @Output() onClose      = new EventEmitter<OrderResponse>();
  @Output() onDownloadPdf = new EventEmitter<OrderResponse>();

  // ── Helpers statut ────────────────────────────────────────────────

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING_PAYMENT:            'En attente de paiement',
      PAID_AWAITING_DISPATCH:     'Payé — préparation',
      DISPATCHED_TO_TRANSPORTER:  'Assigné au transporteur',
      IN_TRANSIT:                 'En transit',
      PARTIALLY_DELIVERED:        'Partiellement livré',
      DELIVERED:                  'Livré',
      CANCELLED:                  'Annulé',
    };
    return map[status] ?? status;
  }

  statusColor(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING_PAYMENT:            'warning',
      PAID_AWAITING_DISPATCH:     'primary',
      DISPATCHED_TO_TRANSPORTER:  'primary',
      IN_TRANSIT:                 'tertiary',
      PARTIALLY_DELIVERED:        'tertiary',
      DELIVERED:                  'success',
      CANCELLED:                  'medium',
    };
    return map[status] ?? 'medium';
  }

  statusIcon(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING_PAYMENT:            'pi pi-credit-card',
      PAID_AWAITING_DISPATCH:     'pi pi-box',
      DISPATCHED_TO_TRANSPORTER:  'pi pi-user',
      IN_TRANSIT:                 'pi pi-truck',
      PARTIALLY_DELIVERED:        'pi pi-truck',
      DELIVERED:                  'pi pi-check-circle',
      CANCELLED:                  'pi pi-times-circle',
    };
    return map[status] ?? 'pi pi-circle';
  }

  // ── Conditions d'affichage ────────────────────────────────────────

  get canPay(): boolean {
    return this.order.status === 'PENDING_PAYMENT' && !this.order.is_paid;
  }

  get canDispute(): boolean {
    return ['IN_TRANSIT', 'PARTIALLY_DELIVERED', 'DELIVERED'].includes(this.order.status);
  }

  get canClose(): boolean {
    return this.order.status === 'DELIVERED';
  }

  get canDownloadPdf(): boolean {
    return this.order.status === 'DELIVERED' || this.order.status === 'CANCELLED';
  }

  get showProgress(): boolean {
    return (
      this.order.ordered_quantity > 0 &&
      this.order.status !== 'PENDING_PAYMENT' &&
      this.order.status !== 'CANCELLED'
    );
  }
}
