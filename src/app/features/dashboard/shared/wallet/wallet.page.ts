import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonBadge, IonButton, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { WalletStore } from 'src/app/core/services/api/wallet/wallet.store';
import { WithdrawalCreate, WithdrawalStatus, TransactionType } from 'src/app/core/services/api/wallet/wallet.model';
import { WithdrawalModalComponent } from './components/withdrawal-modal/withdrawal-modal.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText,
    IonBadge, IonButton, IonSpinner,
    WithdrawalModalComponent,
  ],
  templateUrl: './wallet.page.html',
})
export class WalletPage implements OnInit {
  private walletStore = inject(WalletStore);
  private toastCtrl  = inject(ToastController);

  readonly balance      = this.walletStore.balance;
  readonly transactions = this.walletStore.transactions;
  readonly withdrawals  = this.walletStore.withdrawals;
  readonly isLoading    = this.walletStore.isLoading;
  readonly isSubmitting = this.walletStore.isSubmitting;

  readonly activeTab    = signal<'transactions' | 'withdrawals'>('transactions');
  readonly showWithdraw = signal(false);

  ngOnInit() {
    this.walletStore.loadBalance();
    this.walletStore.loadWithdrawals();
  }

  async refresh(event: CustomEvent) {
    await Promise.all([
      this.walletStore.loadBalance(),
      this.walletStore.loadWithdrawals(),
    ]);
    (event.target as HTMLIonRefresherElement).complete();
  }

  async submitWithdrawal(dto: WithdrawalCreate) {
    try {
      await this.walletStore.createWithdrawal(dto);
      this.showWithdraw.set(false);
      this.toast('Demande de retrait soumise avec succès', 'success');
    } catch {
      this.toast('Erreur lors de la demande de retrait', 'danger');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────

  withdrawalStatusLabel(status: WithdrawalStatus): string {
    const map: Record<WithdrawalStatus, string> = {
      DRAFT:          'Brouillon',
      PENDING_REVIEW: 'En attente',
      APPROVED:       'Approuvé',
      PROCESSING:     'En traitement',
      COMPLETED:      'Effectué',
      REJECTED:       'Refusé',
    };
    return map[status] ?? status;
  }

  withdrawalStatusColor(status: WithdrawalStatus): string {
    const map: Record<WithdrawalStatus, string> = {
      DRAFT:          'medium',
      PENDING_REVIEW: 'warning',
      APPROVED:       'primary',
      PROCESSING:     'tertiary',
      COMPLETED:      'success',
      REJECTED:       'danger',
    };
    return map[status] ?? 'medium';
  }

  transactionIcon(type: TransactionType): string {
    return type === 'CREDIT' ? 'pi pi-arrow-down-left' : 'pi pi-arrow-up-right';
  }

  transactionColor(type: TransactionType): string {
    return type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500';
  }

  transactionSign(type: TransactionType): string {
    return type === 'CREDIT' ? '+' : '-';
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
