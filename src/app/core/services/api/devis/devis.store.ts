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
  QuoteStatus,
  OrderStatus,
} from './devis.model';

@Injectable({ providedIn: 'root' })
export class DevisStore {

  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  readonly myQuotes      = signal<QuoteSummary[]>([]);
  readonly myOrders      = signal<OrderResponse[]>([]);
  readonly currentQuote  = signal<QuoteResponse | null>(null);
  readonly currentOrder  = signal<OrderResponse | null>(null);
  readonly isLoading     = signal(false);
  readonly isSubmitting  = signal(false);

  readonly pendingQuotes = computed(() =>
    this.myQuotes().filter((q) => q.status === 'PENDING' && !q.is_expired),
  );
  readonly activeOrders = computed(() =>
    this.myOrders().filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'),
  );

  constructor(
    private api: DevisApiService,
    private router: Router,
  ) {}

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

  async createQuote(dto: CreateQuoteDto): Promise<QuoteResponse> {
    this.isSubmitting.set(true);
    try {
      const quote = await firstValueFrom(this.api.createQuote(dto));
      this.myQuotes.update((list) => [
        {
          public_id: quote.public_id,
          product_name: quote.product_name,
          client_name: '',
          quantity: quote.quantity,
          total_price: quote.total_price,
          status: quote.status,
          created_at: quote.created_at,
          expires_at: quote.expires_at,
          is_expired: quote.is_expired,
        },
        ...list,
      ]);
      return quote;
    } finally {
      this.isSubmitting.set(false);
    }
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
}
