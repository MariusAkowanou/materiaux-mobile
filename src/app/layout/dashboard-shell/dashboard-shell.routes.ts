import { Routes } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell.component';

export const dashboardShellRoutes: Routes = [
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () =>
          import('../../features/dashboard/home/home.page').then((m) => m.HomePage),
      },

      // ── CLIENT ──────────────────────────────────────────────
      {
        path: 'client/catalogue',
        loadComponent: () =>
          import('../../features/dashboard/client/catalogue/catalogue.page').then((m) => m.CataloguePage),
      },
      {
        path: 'client/catalogue/:id',
        loadComponent: () =>
          import('../../features/dashboard/client/catalogue/catalogue-detail/catalogue-detail.page').then((m) => m.CatalogueDetailPage),
      },
      {
        path: 'client/devis',
        loadComponent: () =>
          import('../../features/dashboard/client/devis/devis.page').then((m) => m.DevisPage),
      },
      {
        path: 'client/commandes',
        loadComponent: () =>
          import('../../features/dashboard/client/commandes/commandes.page').then((m) => m.CommandesPage),
      },

      // ── SUPPLIER ─────────────────────────────────────────────
      {
        path: 'supplier/dashboard',
        loadComponent: () =>
          import('../../features/dashboard/supplier/dashboard/supplier-dashboard.page').then((m) => m.SupplierDashboardPage),
      },
      {
        path: 'supplier/mes-carrieres',
        loadComponent: () =>
          import('../../features/dashboard/supplier/mes-carrieres/mes-carrieres.page').then((m) => m.MesCarrieresPage),
      },
      {
        path: 'supplier/mes-offres',
        loadComponent: () =>
          import('../../features/dashboard/supplier/mes-offres/mes-offres.page').then((m) => m.MesOffresPage),
      },

      // ── TRANSPORTER ──────────────────────────────────────────
      {
        path: 'transporter/dashboard',
        loadComponent: () =>
          import('../../features/dashboard/transporter/dashboard/transporter-dashboard.page').then((m) => m.TransporterDashboardPage),
      },
      {
        path: 'transporter/mes-courses',
        loadComponent: () =>
          import('../../features/dashboard/transporter/mes-courses/mes-courses.page').then((m) => m.MesCoursesPage),
      },
      {
        path: 'transporter/mes-tarifs',
        loadComponent: () =>
          import('../../features/dashboard/transporter/mes-tarifs/mes-tarifs.page').then((m) => m.MesTarifsPage),
      },

      // ── SHARED ───────────────────────────────────────────────
      {
        path: 'shared/wallet',
        loadComponent: () =>
          import('../../features/dashboard/shared/wallet/wallet.page').then((m) => m.WalletPage),
      },
      {
        path: 'shared/profil',
        loadComponent: () =>
          import('../../features/dashboard/shared/profil/profil.page').then((m) => m.ProfilPage),
      },

      // ── ADMIN ─────────────────────────────────────────────────
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('../../features/dashboard/admin/dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'admin/utilisateurs',
        loadComponent: () =>
          import('../../features/dashboard/admin/utilisateurs/utilisateurs.page').then((m) => m.UtilisateursPage),
      },
      {
        path: 'admin/retraits',
        loadComponent: () =>
          import('../../features/dashboard/admin/retraits/retraits.page').then((m) => m.RetraitsPage),
      },
      {
        path: 'admin/partenariats',
        loadComponent: () =>
          import('../../features/dashboard/admin/partenariats/partenariats.page').then((m) => m.PartenariatsPage),
      },
    ],
  },
];
