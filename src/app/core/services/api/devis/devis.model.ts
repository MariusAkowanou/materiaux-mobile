export type DeliverySpeed = 'NORMAL' | 'RAPIDE' | 'ULTRA_RAPIDE';

export type QuoteStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED'| 'COMPLETED';

export type OrderStatus =
  | 'CONFIRMED'                // Commande créée — en attente de paiement
  | 'PENDING_PAYMENT'          // Alias possible côté API
  | 'PAID_AWAITING_DISPATCH'
  | 'DISPATCHED_TO_TRANSPORTER'
  | 'IN_PROGRESS'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'COMPLETED';

export type DisputeCategory =
  | 'QUANTITE_MANQUANTE'
  | 'QUALITE_INSUFFISANTE'
  | 'LIVRAISON_INCORRECTE'
  | 'AUTRE';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

// ── DTOs entrants ─────────────────────────────────────────────────────────────

export interface CreateQuoteDto {
  product_id: number;
  quantity: number;
  delivery_address: string;
  delivery_datetime: string;  // ISO 8601
  delivery_speed: DeliverySpeed;
}

// ── Wizard / Brouillon de devis ──────────────────────────────────────────────

export interface DevisWizardDraft {
  step: 1 | 2 | 3 | 4;
  adresse: string | null;
  latitude: number | null;
  longitude: number | null;
  productId: number | null;
  productName: string | null;
  uniteVente: string | null;       // ex: "m³", "tonne", "voyage", "sac"
  quantite: number | null;         // quantité saisie par l'utilisateur
  // Transport (calculé à titre informatif, pas envoyé à l'API)
  camionTypeId: number | null;
  camionLibelle: string | null;
  nbVoyages: number;
  deliveryDatetime: string | null;
  deliverySpeed: DeliverySpeed;
}



export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreateDeliveryDto {
  quantity_delivered: number;
  delivered_at: string;
  transporter_id: string;
  truck_id: string;
  delivery_speed: DeliverySpeed;
}

export interface CreateDisputeDto {
  reason: string;
  category: DisputeCategory;
}

// ── Réponses ──────────────────────────────────────────────────────────────────

export interface DistanceInfo {
  distance_km: string;         // Decimal string from API
  distance_text?: string;
  duration_text?: string;
  transport_formula: string;
  origin_address?: string;
  distance_simulated?: boolean;
}

export interface QuoteResponse {
  public_id: string;
  product_id: number;
  product_name: string;
  quantity: string;            // Decimal string from API (e.g. "26.00")
  material_cost: string;       // Decimal string
  transport_cost: string;      // Decimal string
  total_price: string;         // Decimal string
  distance_info: DistanceInfo | null;
  supplier_name: string;       // Name of the supplier
  supplier_id?: string;
  status: QuoteStatus;
  can_be_ordered: boolean;
  trucks_configuration: string[];
  delivery_address?: string;
  delivery_datetime?: string;
  delivery_speed?: DeliverySpeed;
  expires_at?: string;
  created_at?: string;
  is_expired?: boolean;
  time_remaining_h?: number;
  product_category?: string;
}

export interface QuoteSummary {
  public_id: string;
  product_name: string;
  client_name: string;
  quantity: number;
  total_price: number;
  status: QuoteStatus;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

// ── Snapshot des règles de calcul ────────────────────────────────────────────
export interface AppliedRulesSnapshot {
  algorithm: string;
  distance_km: number;
  unit_price_ht_selected: number;
  supplier_id: string;
  trucks_configuration: string[];
}

// ── Résumé du devis inclus dans la commande ───────────────────────────────────
export interface QuoteSummaryInOrder {
  public_id: string;
  product_id: number;
  product_name: string;
  product_category: string;
  quantity: string;            // Decimal string
  delivery_address: string;
  delivery_datetime: string;
  delivery_speed: DeliverySpeed;
  material_cost: string;       // Decimal string
  transport_cost: string;      // Decimal string
  total_price: string;         // Decimal string
  distance_info: DistanceInfo | null;
  supplier_id: string;
  supplier_name: string;
  status: QuoteStatus;
  expires_at: string;
  created_at: string;
  is_expired: boolean;
  time_remaining_h: number;
  can_be_ordered: boolean;
  applied_rules_snapshot?: AppliedRulesSnapshot;
}

export interface OrderResponse {
  public_id: string;
  order_number: string;
  delivery_speed: DeliverySpeed;
  ordered_quantity: string;       // Decimal string
  delivered_quantity: string;     // Decimal string
  remaining_quantity: string;     // Decimal string
  completion_pct: number;
  assigned_transporter_name: string | null;
  truck_info: string | null;
  payment_method: string | null;
  is_paid: boolean;
  payment_confirmed_at: string | null;
  status: OrderStatus;
  created_at: string;
  quote_summary: QuoteSummaryInOrder;
  // Champs supplémentaires selon le rôle (supplier view)
  client_name?: string;
  client_phone?: string;
}

export interface PaymentInitResponse {
  checkout_url?: string;
  payment_url?: string;
  reference?: string;
  transaction_id?: string;
  payment_token?: string;
  order_public_id?: string;
}

export interface InitPaymentDto {
  return_url?: string;
  cancel_url?: string;
}

export interface PaydunyaPushDto {
  phone: string;
}

export interface DeliveryResponse {
  public_id: string;
  delivery_number: number;
  quantity_delivered: number;
  delivered_at: string;
  transporter_name: string;
  truck_plate: string;
  delivery_speed: DeliverySpeed;
  photos_count: number;
  weight_ticket_url: string | null;
  created_at: string;
}

export interface DisputeResponse {
  public_id: string;
  reason: string;
  category: DisputeCategory;
  status: DisputeStatus;
  resolution_notes: string | null;
  refund_amount: number | null;
  created_at: string;
}
