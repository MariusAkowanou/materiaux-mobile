import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WalletApiService } from './wallet.api.service';
import {
  WalletBalance,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalCreate,
} from './wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletStore {

  // ── État ──────────────────────────────────────────────────────────
  readonly balance      = signal<number>(0);
  readonly transactions = signal<WalletTransaction[]>([]);
  readonly withdrawals  = signal<WithdrawalRequest[]>([]);
  readonly isLoading    = signal(false);
  readonly isSubmitting = signal(false);

  // ── Computed ──────────────────────────────────────────────────────
  readonly credits = computed(() =>
    this.transactions().filter((t) => t.transaction_type === 'CREDIT'),
  );
  readonly debits = computed(() =>
    this.transactions().filter((t) => t.transaction_type === 'DEBIT'),
  );
  readonly pendingWithdrawals = computed(() =>
    this.withdrawals().filter(
      (w) => w.status === 'PENDING_REVIEW' || w.status === 'PROCESSING',
    ),
  );

  constructor(private api: WalletApiService) {}

  // ── Actions ───────────────────────────────────────────────────────

  async loadBalance(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data: WalletBalance = await firstValueFrom(this.api.getBalance());
      this.balance.set(data.balance);
      this.transactions.set(data.recent_transactions);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadWithdrawals(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getWithdrawals());
      this.withdrawals.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createWithdrawal(dto: WithdrawalCreate): Promise<WithdrawalRequest> {
    this.isSubmitting.set(true);
    try {
      const req = await firstValueFrom(this.api.createWithdrawal(dto));
      this.withdrawals.update((list) => [req, ...list]);
      // Le backend pré-débite le solde à la création
      this.balance.update((b) => b - dto.amount);
      return req;
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
