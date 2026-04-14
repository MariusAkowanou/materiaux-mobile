import { Component, computed, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { AuthStore } from '../../core/services/api/auth/auth.store';
import { UserRole } from '../../core/services/api/auth/auth.model';

interface TabConfig {
  tab: string;
  route: string;
  icon: string;
  label: string;
}

/**
 * DashboardShellComponent — Layout avec ion-tabs dynamiques configurés
 * selon le primary_role de l'utilisateur connecté.
 *
 * CLIENT      → Accueil | Catalogue | Devis | Commandes | Profil
 * SUPPLIER    → Dashboard | Offres | Carrières | Wallet | Profil
 * TRANSPORTER → Dashboard | Courses | Tarifs | Wallet | Profil
 * ADMIN       → Interface dédiée sans tabs standards
 */
@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet,
  ],
  templateUrl: './dashboard-shell.component.html',
})
export class DashboardShellComponent {
  private authStore = inject(AuthStore);

  /** Map des onglets par rôle */
  private readonly tabsByRole: Record<string, TabConfig[]> = {
    CLIENT: [
      { tab: 'home',       route: '/dashboard/home',                icon: 'pi pi-home',          label: 'Accueil'    },
      { tab: 'catalogue',  route: '/dashboard/client/catalogue',    icon: 'pi pi-th-large',      label: 'Catalogue'  },
      { tab: 'devis',      route: '/dashboard/client/devis',        icon: 'pi pi-file',          label: 'Devis'      },
      { tab: 'commandes',  route: '/dashboard/client/commandes',    icon: 'pi pi-shopping-cart', label: 'Commandes'  },
      { tab: 'profil',     route: '/dashboard/shared/profil',       icon: 'pi pi-user',          label: 'Profil'     },
    ],
    SUPPLIER: [
      { tab: 'dashboard',  route: '/dashboard/supplier/dashboard',  icon: 'pi pi-chart-bar',     label: 'Dashboard'  },
      { tab: 'offres',     route: '/dashboard/supplier/mes-offres', icon: 'pi pi-tag',           label: 'Offres'     },
      { tab: 'carrieres',  route: '/dashboard/supplier/mes-carrieres', icon: 'pi pi-map-marker', label: 'Carrières'  },
      { tab: 'wallet',     route: '/dashboard/shared/wallet',       icon: 'pi pi-wallet',        label: 'Wallet'     },
      { tab: 'profil',     route: '/dashboard/shared/profil',       icon: 'pi pi-user',          label: 'Profil'     },
    ],
    TRANSPORTER: [
      { tab: 'dashboard',  route: '/dashboard/transporter/dashboard', icon: 'pi pi-chart-bar',   label: 'Dashboard'  },
      { tab: 'courses',    route: '/dashboard/transporter/mes-courses', icon: 'pi pi-truck',     label: 'Courses'    },
      { tab: 'tarifs',     route: '/dashboard/transporter/mes-tarifs', icon: 'pi pi-list',       label: 'Tarifs'     },
      { tab: 'wallet',     route: '/dashboard/shared/wallet',       icon: 'pi pi-wallet',        label: 'Wallet'     },
      { tab: 'profil',     route: '/dashboard/shared/profil',       icon: 'pi pi-user',          label: 'Profil'     },
    ],
    ADMIN: [
      { tab: 'utilisateurs', route: '/dashboard/admin/utilisateurs', icon: 'pi pi-users',        label: 'Utilisateurs' },
      { tab: 'partenariats', route: '/dashboard/admin/partenariats', icon: 'pi pi-briefcase',    label: 'Partenariats' },
      { tab: 'retraits',     route: '/dashboard/admin/retraits',     icon: 'pi pi-money-bill',   label: 'Retraits'     },
    ],
    COLLABORATOR: [
      { tab: 'home',       route: '/dashboard/home',                icon: 'pi pi-home',          label: 'Accueil'    },
      { tab: 'profil',     route: '/dashboard/shared/profil',       icon: 'pi pi-user',          label: 'Profil'     },
    ],
  };

  /** Liste des onglets calculée selon le rôle actif */
  readonly tabs = computed<TabConfig[]>(() => {
    const role = this.authStore.primaryRole() ?? 'CLIENT';
    return this.tabsByRole[role] ?? this.tabsByRole['CLIENT'];
  });

  /** Vrai si l'utilisateur a le rôle ADMIN (affichage sans tabs standards) */
  readonly isAdmin = computed(() => this.authStore.primaryRole() === 'ADMIN');
}
