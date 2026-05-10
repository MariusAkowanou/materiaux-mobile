import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner } from '@ionic/angular/standalone';
import { OrderResponse } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, IonSpinner],
  templateUrl: './payment-modal.component.html',
})
export class PaymentModalComponent {
  @Input() order!: OrderResponse;
  @Input() isLoading = false;

  @Output() payMoneroo  = new EventEmitter<void>();
  @Output() payPaydunya = new EventEmitter<string>();
  @Output() dismissed   = new EventEmitter<void>();

  readonly tab = signal<'moneroo' | 'paydunya'>('moneroo');
  phone = '';

  /** Montant total depuis le devis imbriqué (string → number) */
  get totalPrice(): number {
    return parseFloat(this.order?.quote_summary?.total_price ?? '0');
  }

  get phoneValid(): boolean {
    return /^\+?[0-9]{8,15}$/.test(this.phone.trim());
  }

  submitPaydunya(): void {
    if (!this.phoneValid) return;
    this.payPaydunya.emit(this.phone.trim());
  }

  close(): void { this.dismissed.emit(); }
}
