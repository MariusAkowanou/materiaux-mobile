export type TransactionType = 'CREDIT' | 'DEBIT';

export type WithdrawalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED';

export type PaymentMethod =
  | 'MOBILE_MONEY_MTN'
  | 'MOBILE_MONEY_MOOV'
  | 'VIREMENT_BANCAIRE';

// ── Réponses ──────────────────────────────────────────────────────────────────

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface WalletBalance {
  user_id: string;
  balance: number;
  recent_transactions: WalletTransaction[];
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_details: string;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface WithdrawalCreate {
  amount: number;
  payment_method: PaymentMethod;
  payment_details: string;   // numéro Mobile Money ou IBAN
}
