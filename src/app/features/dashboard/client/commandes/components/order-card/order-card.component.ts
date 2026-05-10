import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { OrderResponse, OrderStatus } from 'src/app/core/services/api/devis/devis.model';

interface StatusConfig {
  label: string;
  bg: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonSpinner],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  @Input() order!: OrderResponse;
  @Input() isProcessing = false;

  @Output() payMoneroo    = new EventEmitter<OrderResponse>();
  @Output() openDispute   = new EventEmitter<OrderResponse>();
  @Output() cancelRequest = new EventEmitter<OrderResponse>();
  @Output() closeRequest  = new EventEmitter<OrderResponse>();
  @Output() downloadPdf   = new EventEmitter<OrderResponse>();
  @Output() viewDetail    = new EventEmitter<OrderResponse>();

  get cfg(): StatusConfig {
    const map: Record<string, StatusConfig> = {
      CONFIRMED:                 { label: 'En attente',             bg: '#fff7ed', color: '#f97316', icon: 'pi-clock' },
      ASSIGNED:                  { label: 'Assigné',                bg: '#eff6ff', color: '#3b82f6', icon: 'pi-user' },
      IN_PROGRESS:                { label: 'En transit',             bg: '#ecfeff', color: '#0891b2', icon: 'pi-truck' },
      DELIVERED:                 { label: 'Livré',                  bg: '#f0fdf4', color: '#16a34a', icon: 'pi-check-circle' },
      CANCELLED:                 { label: 'Annulé',                 bg: '#fef2f2', color: '#dc2626', icon: 'pi-times-circle' },
    };
    return map[this.order.status] ?? { label: this.order.status, bg: '#f3f4f6', color: '#6b7280', icon: 'pi-info-circle' };
  }

  /** Peut payer si non payé et statut actif */
  get canPay():     boolean { return !this.order.is_paid; }
  get canCancel():  boolean { return ['CONFIRMED','PENDING_PAYMENT'].includes(this.order.status); }
  get canDispute(): boolean { return ['IN_PROGRESS','DELIVERED'].includes(this.order.status); }
  get canClose():   boolean { return ['DELIVERED'].includes(this.order.status); }
  get showPdf():    boolean { return this.order.is_paid; }

  /** Raccourcis vers les données du devis imbriqué */
  get productName(): string { return this.order.quote_summary?.product_name ?? '—'; }
  get supplierName(): string { return this.order.quote_summary?.supplier_name ?? '—'; }
  get totalPrice(): number  { return parseFloat(this.order.quote_summary?.total_price ?? '0'); }
  get qty(): number          { return parseFloat(this.order.ordered_quantity ?? '0'); }
}
