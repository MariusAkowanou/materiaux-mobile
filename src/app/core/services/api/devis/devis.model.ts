export type DeliverySpeed = 'NORMAL' | 'RAPIDE' | 'ULTRA_RAPIDE';

export type QuoteStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID_AWAITING_DISPATCH'
  | 'DISPATCHED_TO_TRANSPORTER'
  | 'IN_TRANSIT'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'CANCELLED';

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
  distance_km: number;
  distance_text: string;
  duration_text: string;
  transport_formula: string;
  origin_address: string;
  distance_simulated: boolean;
}

export interface QuoteResponse {
  public_id: string;
  product_id: number;
  product_name: string;
  product_category: string;
  quantity: number;
  delivery_address: string;
  delivery_datetime: string;
  delivery_speed: DeliverySpeed;
  material_cost: number;
  transport_cost: number;
  total_price: number;
  distance_info: DistanceInfo | null;
  supplier_id: string;
  status: QuoteStatus;
  expires_at: string;
  created_at: string;
  is_expired: boolean;
  time_remaining_h: number;
  can_be_ordered: boolean;
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

export interface OrderResponse {
  public_id: string;
  order_number: string;
  product_name: string;
  supplier_name: string;
  delivery_address: string;
  total_price: number;
  delivery_speed: DeliverySpeed;
  ordered_quantity: number;
  delivered_quantity: number;
  remaining_quantity: number;
  completion_pct: number;
  assigned_transporter_name: string | null;
  truck_info: string | null;
  payment_method: string | null;
  is_paid: boolean;
  status: OrderStatus;
  created_at: string;
}

export interface PaymentInitResponse {
  payment_url: string;
  payment_token: string;
  order_public_id: string;
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
