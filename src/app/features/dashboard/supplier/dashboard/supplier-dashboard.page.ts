import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonSkeletonText, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { OrderResponse, OrderStatus } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, DatePipe,
    IonContent, IonHeader, IonToolbar,
    IonSkeletonText, IonRefresher, IonRefresherContent,
  ],
  templateUrl: './supplier-dashboard.page.html',
})
export class SupplierDashboardPage implements OnInit {
  private devisStore = inject(DevisStore);
  private router     = inject(Router);

  readonly isLoading  = this.devisStore.isLoading;
  readonly activeTab  = signal<'active' | 'history'>('active');

  readonly orders = this.devisStore.supplierOrders;

  readonly activeOrders = computed(() =>
    this.orders().filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED',
    ),
  );
  readonly completedOrders = computed(() =>
    this.orders().filter(
      (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED',
    ),
  );

  // ── Compteurs stats ────────────────────────────────────────────────
  readonly pendingCount = computed(() =>
    this.orders().filter(
      (o) => ['CONFIRMED', 'PENDING_PAYMENT', 'PAID_AWAITING_DISPATCH'].includes(o.status),
    ).length,
  );
  readonly inTransitCount = computed(() =>
    this.orders().filter(
      (o) => ['DISPATCHED_TO_TRANSPORTER', 'IN_PROGRESS', 'PARTIALLY_DELIVERED'].includes(o.status),
    ).length,
  );
  readonly deliveredCount = computed(() =>
    this.orders().filter((o) => o.status === 'DELIVERED').length,
  );
  readonly totalCount = computed(() => this.orders().length);

  ngOnInit(): void {
    this.devisStore.loadSupplierOrders();
  }

  async refresh(): Promise<void> {
    await this.devisStore.loadSupplierOrders();
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    await this.devisStore.loadSupplierOrders();
    (event.target as HTMLIonRefresherElement).complete();
  }

  goToDetail(order: OrderResponse): void {
    this.router.navigate(['/dashboard/supplier/commandes', order.public_id]);
  }

  // ── Helpers ────────────────────────────────────────────────────────
  num(v: string | number | null | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? parseFloat(v) : v;
  }

  statusCfg(status: string): { label: string; bg: string; color: string; icon: string } {
    const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      CONFIRMED:                 { label: 'En attente', bg: '#fff7ed', color: '#f97316', icon: 'pi-clock' },
      ASSIGNED:                  { label: 'Assigné',    bg: '#1d2b38ff', color: '#ffffff', icon: 'pi-user' },
      IN_PROGRESS:               { label: 'En transit', bg: '#ecfeff', color: '#0891b2', icon: 'pi-truck' },
      DELIVERED:                 { label: 'Livré',      bg: '#f0fdf4', color: '#16a34a', icon: 'pi-check-circle' },
      COMPLETED:                 { label: 'Terminé',    bg: '#ecfeff', color: '#222222', icon: 'pi-check' },
      CANCELLED:                 { label: 'Annulé',    bg: '#fef2f2', color: '#dc2626', icon: 'pi-times-circle' },
    };
    return map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280', icon: 'pi-info-circle' };
  }
}
