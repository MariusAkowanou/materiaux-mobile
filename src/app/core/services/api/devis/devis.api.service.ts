import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
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
} from './devis.model';

@Injectable({ providedIn: 'root' })
export class DevisApiService {
  private readonly url = `${environment.apiUrl}/devis`;

  constructor(private http: HttpClient) {}

  createQuote(dto: CreateQuoteDto): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${this.url}/`, dto);
  }

  getMyQuotes(): Observable<QuoteSummary[]> {
    return this.http.get<QuoteSummary[]>(`${this.url}/`);
  }

  getQuote(publicId: string): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${this.url}/${publicId}`);
  }

  cancelQuote(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${publicId}`);
  }

  confirmOrder(publicId: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.url}/${publicId}/confirm`, {});
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.url}/orders/`);
  }

  getOrder(publicId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.url}/orders/${publicId}`);
  }

  updateOrderStatus(publicId: string, dto: UpdateOrderStatusDto): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.url}/orders/${publicId}/status`, dto);
  }

  declareDelivery(orderPublicId: string, dto: CreateDeliveryDto): Observable<DeliveryResponse> {
    return this.http.post<DeliveryResponse>(`${this.url}/orders/${orderPublicId}/deliveries`, dto);
  }

  createDispute(orderPublicId: string, dto: CreateDisputeDto): Observable<DisputeResponse> {
    return this.http.post<DisputeResponse>(`${this.url}/orders/${orderPublicId}/disputes`, dto);
  }
}
