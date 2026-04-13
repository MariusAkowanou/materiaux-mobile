import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { AuthStore } from '../../core/services/api/auth/auth.store';
import { UserRole } from '../../core/services/api/auth/auth.model';

interface TabItem {
  label: string;
  icon: string;
  route: string;
}

const TAB_CONFIG: Partial<Record<UserRole, TabItem[]>> = {
  CLIENT: [
    { label: 'Accueil',   icon: 'pi-home',      route: 'home' },
    { label: 'Catalogue', icon: 'pi-list',       route: 'client/catalogue' },
    { label: 'Devis',     icon: 'pi-file-edit',  route: 'client/devis' },
    { label: 'Commandes', icon: 'pi-box',        route: 'client/commandes' },
    { label: 'Profil',    icon: 'pi-user',       route: 'shared/profil' },
  ],
  SUPPLIER: [
    { label: 'Dashboard',  icon: 'pi-chart-bar',  route: 'supplier/dashboard' },
    { label: 'Carrières',  icon: 'pi-map-marker', route: 'supplier/mes-carrieres' },
    { label: 'Offres',     icon: 'pi-tag',        route: 'supplier/mes-offres' },
    { label: 'Wallet',     icon: 'pi-wallet',     route: 'shared/wallet' },
    { label: 'Profil',     icon: 'pi-user',       route: 'shared/profil' },
  ],
  TRANSPORTER: [
    { label: 'Dashboard', icon: 'pi-chart-bar', route: 'transporter/dashboard' },
    { label: 'Courses',   icon: 'pi-truck',     route: 'transporter/mes-courses' },
    { label: 'Tarifs',    icon: 'pi-dollar',    route: 'transporter/mes-tarifs' },
    { label: 'Wallet',    icon: 'pi-wallet',    route: 'shared/wallet' },
    { label: 'Profil',    icon: 'pi-user',      route: 'shared/profil' },
  ],
  ADMIN: [
    { label: 'Dashboard',    icon: 'pi-chart-bar', route: 'admin/dashboard' },
    { label: 'Utilisateurs', icon: 'pi-users',     route: 'admin/utilisateurs' },
    { label: 'Retraits',     icon: 'pi-wallet',    route: 'admin/retraits' },
    { label: 'Partenariats', icon: 'pi-handshake', route: 'admin/partenariats' },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT:      'Client',
  SUPPLIER:    'Fournisseur',
  TRANSPORTER: 'Transporteur',
  ADMIN:       'Admin',
  COLLABORATOR:'Collab',
};

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonRouterOutlet,
    RouterLink,
  ],
  template: `
      @if (isHybrid()) {
        <ion-header class="ion-no-border [--background:var(--color-surface)]">
          <ion-toolbar class="[--background:var(--color-surface)] [--border-color:var(--color-surface-dark)] [--min-height:48px] [--padding-start:12px] [--padding-end:12px]">
            <ion-segment
              class="[--background:var(--color-surface-dark)]"
              [value]="activeRole()"
              (ionChange)="onRoleChange($event)">
              @for (role of hybridRoles(); track role) {
                <ion-segment-button 
                  class="[--color:var(--color-text-muted)] [--color-checked:var(--color-primary)] [--background-checked:#ffffff] [--border-radius:8px] [--indicator-color:transparent] !min-h-[32px] !text-[11px] !font-semibold !normal-case !tracking-normal"
                  [value]="role">
                  <ion-label>{{ roleLabel(role) }}</ion-label>
                </ion-segment-button>
              }
            </ion-segment>
          </ion-toolbar>
        </ion-header>
      }

      <ion-tabs>
        <ion-router-outlet />
        <ion-tab-bar 
          class="[--background:#ffffff] [--color:var(--color-text-muted)] [--color-selected:var(--color-primary)] [--border:1px_solid_var(--color-surface-dark)] !h-[64px] !pb-[env(safe-area-inset-bottom,0px)]"
          slot="bottom">
          @for (tab of activeTabs(); track tab.route) {
            <ion-tab-button
              class="[--padding-top:10px] [--padding-bottom:4px]"
              [tab]="tab.route"
              [routerLink]="['/dashboard', tab.route]">
              <i class="pi text-[20px] leading-none mb-[3px] {{ tab.icon }}"></i>
              <ion-label class="!text-[9px] !font-medium !uppercase !tracking-[0.04em]">{{ tab.label }}</ion-label>
            </ion-tab-button>
          }
        </ion-tab-bar>
      </ion-tabs>
  `,
})
export class DashboardShellComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isHybrid = this.authStore.isHybrid;
  readonly hybridRoles = computed<UserRole[]>(() =>
    this.authStore.userRoles().filter((r): r is UserRole => r in TAB_CONFIG)
  );

  readonly activeRole = signal<UserRole>('CLIENT');

  readonly activeTabs = computed<TabItem[]>(() =>
    TAB_CONFIG[this.activeRole()] ?? TAB_CONFIG['CLIENT']!
  );

  ngOnInit(): void {
    const role = this.authStore.primaryRole();
    if (role && role in TAB_CONFIG) {
      this.activeRole.set(role);
    }
  }

  onRoleChange(event: CustomEvent): void {
    const role = event.detail.value as UserRole;
    if (!role || !(role in TAB_CONFIG)) return;
    this.activeRole.set(role);
    const tabs = TAB_CONFIG[role];
    if (tabs?.length) {
      this.router.navigate(['/dashboard', tabs[0].route], { replaceUrl: true });
    }
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role] ?? role;
  }
}
