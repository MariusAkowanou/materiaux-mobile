import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
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

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './dashboard-shell.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
    }
  `]
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
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
    ],
    COMPANY: [
      { tab: 'home',       route: '/dashboard/home',                icon: 'pi pi-home',          label: 'Accueil'    },
      { tab: 'catalogue',  route: '/dashboard/client/catalogue',    icon: 'pi pi-th-large',      label: 'Catalogue'  },
      { tab: 'devis',      route: '/dashboard/client/devis',        icon: 'pi pi-file',          label: 'Devis'      },
      { tab: 'commandes',  route: '/dashboard/client/commandes',    icon: 'pi pi-shopping-cart', label: 'Commandes'  },
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
    ],
    SUPPLIER: [
      { tab: 'dashboard',  route: '/dashboard/supplier/home',  icon: 'pi pi-chart-bar',     label: 'Dashboard'  },
      { tab: 'offres',     route: '/dashboard/supplier/mes-offres', icon: 'pi pi-tag',           label: 'Offres'     },
      { tab: 'carrieres',  route: '/dashboard/supplier/mes-carrieres', icon: 'pi pi-map-marker', label: 'Carrières'  },
      { tab: 'wallet',     route: '/dashboard/wallet',              icon: 'pi pi-wallet',        label: 'Wallet'     },
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
    ],
    TRANSPORTER: [
      { tab: 'dashboard',  route: '/dashboard/transporter/home', icon: 'pi pi-chart-bar',   label: 'Dashboard'  },
      { tab: 'courses',    route: '/dashboard/transporter/mes-courses', icon: 'pi pi-truck',     label: 'Courses'    },
      { tab: 'tarifs',     route: '/dashboard/transporter/mes-tarifs', icon: 'pi pi-list',       label: 'Tarifs'     },
      { tab: 'wallet',     route: '/dashboard/wallet',              icon: 'pi pi-wallet',        label: 'Wallet'     },
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
    ],
    ADMIN: [
      { tab: 'utilisateurs', route: '/dashboard/admin/utilisateurs', icon: 'pi pi-users',        label: 'Utilisateurs' },
      { tab: 'partenariats', route: '/dashboard/admin/partenariats', icon: 'pi pi-briefcase',    label: 'Partenariats' },
      { tab: 'retraits',     route: '/dashboard/admin/retraits',     icon: 'pi pi-money-bill',   label: 'Retraits'     },
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
    ],
    COLLABORATOR: [
      { tab: 'home',       route: '/dashboard/home',                icon: 'pi pi-home',          label: 'Accueil'    },
      { tab: 'profil',     route: '/dashboard/profil',              icon: 'pi pi-user',          label: 'Profil'     },
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
