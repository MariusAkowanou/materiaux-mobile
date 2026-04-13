import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { AuthStore } from '../../../core/services/api/auth/auth.store';

type QuoteStatus  = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'EXPIRED';
type OrderStatus  = 'PENDING_PAYMENT' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
type CourseStatus = 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';

interface StatusBadge { label: string; classes: string; }

interface MockQuote  { id: string; materiau: string; quantite: string; montant: string; status: QuoteStatus;  date: string; }
interface MockOrder  { id: string; client: string;   materiau: string; quantite: string; montant: string; status: OrderStatus;  date: string; }
interface MockCourse { id: string; materiau: string; origine: string;  destination: string; montant: string; status: CourseStatus; date: string; }
interface Kpi        { label: string; value: string; unit?: string; icon: string; accent: string; bg: string; }
interface Category   { label: string; icon: string;  bg: string; color: string; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonFab,
    IonFabButton,
    RouterLink,
  ],
  templateUrl: './home.page.html', 
})
export class HomePage implements OnInit {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isLoading   = signal(true);
  readonly primaryRole = this.authStore.primaryRole;
  readonly currentUser = this.authStore.currentUser;

  // ── CLIENT ────────────────────────────────────────────────────
  readonly categories: Category[] = [
    { label: 'Granulats',   icon: 'pi-th-large',   bg: '#FBE9DF', color: 'var(--color-primary)' },
    { label: 'Sable',       icon: 'pi-circle',     bg: '#FEF9EE', color: '#D97706' },
    { label: 'Ciment',      icon: 'pi-box',        bg: '#F0F0F0', color: '#6B7280' },
    { label: 'Fer à béton', icon: 'pi-bars',       bg: '#EEF2FF', color: '#4338CA' },
    { label: 'Latérite',    icon: 'pi-map-marker', bg: '#FFF7ED', color: '#B45309' },
    { label: 'Ballast',     icon: 'pi-server',     bg: '#F0F9FF', color: '#0284C7' },
  ];

  readonly recentQuotes: MockQuote[] = [
    { id: 'DEV-047', materiau: 'Gravier 15/25', quantite: '5 m³',  montant: '87 500 FCFA',  status: 'IN_TRANSIT', date: 'Il y a 2h' },
    { id: 'DEV-043', materiau: 'Sable fin',     quantite: '10 m³', montant: '65 000 FCFA',  status: 'PENDING',    date: 'Hier' },
    { id: 'DEV-038', materiau: 'Latérite',      quantite: '20 m³', montant: '120 000 FCFA', status: 'DELIVERED',  date: 'Il y a 3 jours' },
  ];

  // ── SUPPLIER ──────────────────────────────────────────────────
  readonly supplierKpis: Kpi[] = [
    { label: 'Offres actives',     value: '12',      icon: 'pi-tag',    accent: 'var(--color-primary)', bg: 'rgba(224,123,57,0.12)' },
    { label: 'Commandes en cours', value: '4',       icon: 'pi-box',    accent: 'var(--color-warning)', bg: 'rgba(255,196,9,0.15)'  },
    { label: 'Solde wallet',       value: '245 000', unit: 'FCFA', icon: 'pi-wallet', accent: 'var(--color-success)', bg: 'rgba(45,211,111,0.12)' },
  ];

  readonly supplierOrders: MockOrder[] = [
    { id: 'CMD-051', client: 'Jean-Baptiste K.', materiau: 'Gravier 5/15', quantite: '8 m³',  montant: '128 000 FCFA', status: 'IN_TRANSIT',      date: 'Il y a 1h' },
    { id: 'CMD-049', client: 'Fidèle Agbo',      materiau: 'Sable fin',    quantite: '15 m³', montant: '97 500 FCFA',  status: 'PENDING_PAYMENT', date: 'Il y a 3h' },
    { id: 'CMD-045', client: 'Rachelle Tohou',   materiau: 'Latérite',     quantite: '30 m³', montant: '180 000 FCFA', status: 'DELIVERED',       date: 'Hier' },
  ];

  // ── TRANSPORTER ───────────────────────────────────────────────
  readonly transporterKpis: Kpi[] = [
    { label: 'Courses assignées', value: '3',       icon: 'pi-truck',  accent: 'var(--color-primary)', bg: 'rgba(224,123,57,0.12)' },
    { label: 'Livrées ce mois',   value: '27',      icon: 'pi-check',  accent: 'var(--color-success)', bg: 'rgba(45,211,111,0.12)' },
    { label: 'Solde wallet',      value: '89 500',  unit: 'FCFA', icon: 'pi-wallet', accent: 'var(--color-warning)', bg: 'rgba(255,196,9,0.15)' },
  ];

  readonly nextCourses: MockCourse[] = [
    { id: 'CRS-023', materiau: 'Gravier 15/25', origine: 'Carrière Ekpè',   destination: 'Cotonou — Godomey', montant: '25 000 FCFA', status: 'ASSIGNED',   date: "Auj. 14h" },
    { id: 'CRS-022', materiau: 'Sable fin',     origine: 'Dépôt Glo-Djigbé',destination: 'Abomey-Calavi',      montant: '18 500 FCFA', status: 'IN_TRANSIT', date: 'En cours' },
    { id: 'CRS-020', materiau: 'Latérite rouge',origine: 'Carrière Ouidah', destination: 'Porto-Novo',         montant: '32 000 FCFA', status: 'DELIVERED',  date: 'Hier' },
  ];

  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 700);
  }

  doRefresh(event: CustomEvent): void {
    setTimeout(() => (event.target as HTMLIonRefresherElement).complete(), 1200);
  }

  goToCatalogue(): void {
    this.router.navigate(['/dashboard/client/catalogue']);
  }

  newQuote(): void {
    this.router.navigate(['/dashboard/client/devis']);
  }

  quoteStatusBadge(status: QuoteStatus): StatusBadge {
    const map: Record<QuoteStatus, StatusBadge> = {
      PENDING:    { label: 'En attente', classes: 'bg-amber-50 text-amber-700' },
      IN_TRANSIT: { label: 'En route',   classes: 'bg-blue-50 text-blue-700' },
      DELIVERED:  { label: 'Livré',      classes: 'bg-green-50 text-green-700' },
      EXPIRED:    { label: 'Expiré',     classes: 'bg-gray-100 text-gray-400' },
    };
    return map[status];
  }

  orderStatusBadge(status: OrderStatus): StatusBadge {
    const map: Record<OrderStatus, StatusBadge> = {
      PENDING_PAYMENT: { label: 'Paiement',  classes: 'bg-amber-50 text-amber-700' },
      IN_TRANSIT:      { label: 'En route',  classes: 'bg-blue-50 text-blue-700' },
      DELIVERED:       { label: 'Livré',     classes: 'bg-green-50 text-green-700' },
      CANCELLED:       { label: 'Annulé',    classes: 'bg-red-50 text-red-600' },
    };
    return map[status];
  }

  courseStatusBadge(status: CourseStatus): StatusBadge {
    const map: Record<CourseStatus, StatusBadge> = {
      ASSIGNED:   { label: 'Assignée', classes: 'bg-amber-50 text-amber-700' },
      IN_TRANSIT: { label: 'En route', classes: 'bg-blue-50 text-blue-700' },
      DELIVERED:  { label: 'Livré',    classes: 'bg-green-50 text-green-700' },
    };
    return map[status];
  }
}
