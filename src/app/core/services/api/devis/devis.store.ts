import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { DevisApiService } from './devis.api.service';
import {
  CreateQuoteDto,
  QuoteResponse,
  QuoteSummary,
  OrderResponse,
  UpdateOrderStatusDto,
  CreateDeliveryDto,
  DeliveryResponse,
  CreateDisputeDto,
  DisputeResponse,
  PaymentInitResponse,
  InitPaymentDto,
  PaydunyaPushDto,
  QuoteStatus,
  OrderStatus,
  DevisWizardDraft,
  QuoteSummaryInOrder,
} from './devis.model';

const DEFAULT_WIZARD_DRAFT: DevisWizardDraft = {
  step: 1,
  adresse: null,
  latitude: null,
  longitude: null,
  productId: null,
  productName: null,
  uniteVente: null,
  quantite: null,
  camionTypeId: null,
  camionLibelle: null,
  nbVoyages: 1,
  deliveryDatetime: null,
  deliverySpeed: 'NORMAL',
};


@Injectable({ providedIn: 'root' })
export class DevisStore {

  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  readonly myQuotes        = signal<QuoteSummary[]>([]);
  readonly myOrders        = signal<OrderResponse[]>([]);
  readonly supplierOrders  = signal<OrderResponse[]>([]);
  readonly currentQuote    = signal<QuoteResponse | null>(null);
  readonly currentOrder    = signal<OrderResponse | null>(null);
  readonly currentQuotes   = signal<QuoteResponse[]>([]);   // résultats de la dernière création
  readonly isLoading       = signal(false);
  readonly isSubmitting    = signal(false);

  readonly wizardDraft   = signal<DevisWizardDraft>(DEFAULT_WIZARD_DRAFT);


  readonly pendingQuotes = computed(() =>
    this.myQuotes().filter((q) => q.status === 'PENDING' && !q.is_expired),
  );
  readonly activeOrders = computed(() =>
    this.myOrders().filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'),
  );

  readonly hasActivePendingQuotes = computed(() => this.pendingQuotes().length > 0);


  constructor(
    private api: DevisApiService,
    private router: Router,
  ) {
    // Restaurer le brouillon depuis le storage si besoin ?
    // Pour l'instant on garde en mémoire vive
  }

  // ── Actions Wizard ────────────────────────────────────────────────

  updateWizard(update: Partial<DevisWizardDraft>): void {
    this.wizardDraft.update((current) => ({ ...current, ...update }));
  }

  resetWizard(): void {
    this.wizardDraft.set(DEFAULT_WIZARD_DRAFT);
    this.currentQuotes.set([]);
  }

  goToStep(step: 1 | 2 | 3 | 4): void {
    this.updateWizard({ step });
  }


  async loadMyQuotes(): Promise<void> {
    this.isLoading.set(true);
    try {
      const quotes = await firstValueFrom(this.api.getMyQuotes());
      this.myQuotes.set(quotes);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadQuote(publicId: string): Promise<void> {
    this.isLoading.set(true);
    this.currentQuote.set(null);
    try {
      const quote = await firstValueFrom(this.api.getQuote(publicId));
      this.currentQuote.set(quote);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createQuote(dto: CreateQuoteDto): Promise<QuoteResponse[]> {
    this.isSubmitting.set(true);
    try {
      const quotes = await firstValueFrom(this.api.createQuote(dto));
      // Stocker les devis fraîchement créés pour l'étape 4
      this.currentQuotes.set(quotes);
      // Mettre à jour la liste résumée (pour hasPending)
      this.myQuotes.update((list) => [
        ...quotes.map((q) => ({
          public_id:    q.public_id,
          product_name: q.product_name,
          client_name:  '',
          quantity:     parseFloat(q.quantity),
          total_price:  parseFloat(q.total_price),
          status:       q.status,
          created_at:   q.created_at ?? new Date().toISOString(),
          expires_at:   q.expires_at ?? '',
          is_expired:   q.is_expired ?? false,
        })),
        ...list,
      ]);
      return quotes;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async cancelOrder(publicId: string): Promise<void> {
    await firstValueFrom(this.api.updateOrderStatus(publicId, { status: 'CANCELLED' }));
    this.myOrders.update((list) =>
      list.map((o) => (o.public_id === publicId ? { ...o, status: 'CANCELLED' as OrderStatus } : o)),
    );
  }

  async cancelQuote(publicId: string): Promise<void> {
    await firstValueFrom(this.api.cancelQuote(publicId));
    this.myQuotes.update((list) =>
      list.map((q) => (q.public_id === publicId ? { ...q, status: 'CANCELLED' as QuoteStatus } : q)),
    );
    if (this.currentQuote()?.public_id === publicId) {
      this.currentQuote.update((q) => q ? { ...q, status: 'CANCELLED' } : null);
    }
  }

  async confirmOrder(publicId: string): Promise<OrderResponse> {
    this.isSubmitting.set(true);
    try {
      const order = await firstValueFrom(this.api.confirmOrder(publicId));
      this.myOrders.update((list) => [order, ...list]);
      this.myQuotes.update((list) =>
        list.map((q) => (q.public_id === publicId ? { ...q, status: 'CONFIRMED' as QuoteStatus } : q)),
      );
      return order;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async loadMyOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const orders = await firstValueFrom(this.api.getMyOrders());
      this.myOrders.set(orders);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSupplierOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const orders = await firstValueFrom(this.api.getSupplierOrders());
      this.supplierOrders.set(orders);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadOrder(publicId: string): Promise<void> {
    this.isLoading.set(true);
    this.currentOrder.set(null);
    try {
      const order = await firstValueFrom(this.api.getOrder(publicId));
      this.currentOrder.set(order);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateOrderStatus(publicId: string, dto: UpdateOrderStatusDto): Promise<void> {
    const order = await firstValueFrom(this.api.updateOrderStatus(publicId, dto));
    this.myOrders.update((list) =>
      list.map((o) => (o.public_id === publicId ? order : o)),
    );
    if (this.currentOrder()?.public_id === publicId) {
      this.currentOrder.set(order);
    }
  }

  async declareDelivery(orderPublicId: string, dto: CreateDeliveryDto): Promise<DeliveryResponse> {
    return firstValueFrom(this.api.declareDelivery(orderPublicId, dto));
  }

  async createDispute(orderPublicId: string, dto: CreateDisputeDto): Promise<DisputeResponse> {
    return firstValueFrom(this.api.createDispute(orderPublicId, dto));
  }

  async closeOrder(publicId: string): Promise<void> {
    const order = await firstValueFrom(this.api.closeOrder(publicId));
    this.myOrders.update((list) =>
      list.map((o) => (o.public_id === publicId ? order : o)),
    );
    if (this.currentOrder()?.public_id === publicId) {
      this.currentOrder.set(order);
    }
  }

  async initPaymentMoneroo(publicId: string, dto: InitPaymentDto = {}): Promise<PaymentInitResponse> {
    return firstValueFrom(this.api.initPaymentMoneroo(publicId, dto));
  }

  async initPaymentPaydunya(publicId: string, dto: PaydunyaPushDto): Promise<void> {
    return firstValueFrom(this.api.initPaymentPaydunya(publicId, dto));
  }

  getOrderPdfUrl(publicId: string): string {
    return this.api.getOrderPdfUrl(publicId);
  }
}
