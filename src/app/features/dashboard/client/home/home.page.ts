import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonSpinner,
} from '@ionic/angular/standalone';
import { AuthStore } from 'src/app/core/services/api/auth/auth.store';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonToolbar, IonSpinner,
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  private authStore  = inject(AuthStore);
  private devisStore = inject(DevisStore);
  private router     = inject(Router);

  readonly user       = this.authStore.currentUser;
  readonly isLoading  = this.devisStore.isLoading;
  readonly myOrders   = this.devisStore.myOrders;
  readonly myQuotes   = this.devisStore.myQuotes;

  readonly firstName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.first_name || u.full_name?.split(' ')[0] || 'vous';
  });

  readonly pendingQuotesCount = computed(() =>
    this.myQuotes().filter(q => q.status === 'PENDING' && !q.is_expired).length,
  );

  readonly activeOrdersCount = computed(() =>
    this.myOrders().filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
  );

  readonly recentOrders = computed(() =>
    [...this.myOrders()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3),
  );

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.devisStore.loadMyOrders(),
      this.devisStore.loadMyQuotes(),
    ]);
  }

  // ── Navigation ──────────────────────────────────────────────────
  goToDevisCreate(): void  { this.router.navigate(['/dashboard/client/devis']); }
  goToCommandes(): void    { this.router.navigate(['/dashboard/client/commandes']); }
  goToCatalogue(): void    { this.router.navigate(['/dashboard/client/catalogue']); }
  goToWallet(): void       { this.router.navigate(['/dashboard/wallet']); }
  goToOrder(id: string): void { this.router.navigate(['/dashboard/client/commandes', id]); }

  // ── Helpers ──────────────────────────────────────────────────────
  orderStatusCfg(status: string): { label: string; color: string; bg: string } {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      CONFIRMED:                  { label: 'En attente',     color: '#f97316', bg: '#fff7ed' },
      PENDING_PAYMENT:            { label: 'Paiement dû',   color: '#ef4444', bg: '#fef2f2' },
      PAID_AWAITING_DISPATCH:     { label: 'Payée',          color: '#3b82f6', bg: '#eff6ff' },
      DISPATCHED_TO_TRANSPORTER:  { label: 'Expédiée',       color: '#8b5cf6', bg: '#f5f3ff' },
      IN_PROGRESS:                { label: 'En transit',     color: '#0891b2', bg: '#ecfeff' },
      PARTIALLY_DELIVERED:        { label: 'Partielle',      color: '#d97706', bg: '#fffbeb' },
      DELIVERED:                  { label: 'Livrée',         color: '#16a34a', bg: '#f0fdf4' },
      CANCELLED:                  { label: 'Annulée',        color: '#dc2626', bg: '#fef2f2' },
    };
    return map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' };
  }
}
