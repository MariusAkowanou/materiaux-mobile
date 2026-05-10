import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  // ─── Route par défaut (CLIENT) ────────────────────────────────────────────
  {
    path: 'home',
     canActivate: [roleGuard],
    data: { roles: ['CLIENT'] },
    loadComponent: () =>
      import('../../features/dashboard/client/home/home.page').then(m => m.HomePage),
  },

  // ─── CLIENT ───────────────────────────────────────────────────────────────
  {
    path: 'client',
    canActivate: [roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      {
        path: 'catalogue',
        loadComponent: () =>
          import('../../features/dashboard/client/catalogue/catalogue.page').then(m => m.CataloguePage),
      },
      {
        path: 'catalogue/:id',
        loadComponent: () =>
          import('../../features/dashboard/client/catalogue/catalogue-detail/catalogue-detail.page').then(m => m.CatalogueDetailPage),
      },
      {
        path: 'devis',
        loadComponent: () =>
          import('../../features/dashboard/client/devis/devis.page').then(m => m.DevisPage),
      },
     
      {
        path: 'commandes',
        loadComponent: () =>
          import('../../features/dashboard/client/commandes/commandes.page').then(m => m.CommandesPage),
      },
      {
        path: 'commandes/:id',
        loadComponent: () =>
          import('../../features/dashboard/client/commandes/commandes-detail.page').then(m => m.CommandesDetailPage),
      },
      {
        path: 'commandes/:id/map',
        loadComponent: () =>
          import('../../features/dashboard/shared/livraison-map/livraison-map.page').then(m => m.LivraisonMapPage),
      }
    ],
  },

  // ─── SUPPLIER ─────────────────────────────────────────────────────────────
  {
    path: 'supplier',
    canActivate: [roleGuard],
    data: { roles: ['SUPPLIER', ] },
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../../features/dashboard/supplier/dashboard/supplier-dashboard.page').then(m => m.SupplierDashboardPage),
      },
      {
        path: 'commandes/:id',
        loadComponent: () =>
          import('../../features/dashboard/supplier/commandes-detail/supplier-order-detail.page').then(m => m.SupplierOrderDetailPage),
      },
            {
        path: 'commandes/:id/map',
        loadComponent: () =>
          import('../../features/dashboard/shared/livraison-map/livraison-map.page').then(m => m.LivraisonMapPage),
      },
      {
        path: 'mes-carrieres',
        loadComponent: () =>
          import('../../features/dashboard/supplier/mes-carrieres/mes-carrieres.page').then(m => m.MesCarrieresPage),
      },
      {
        path: 'mes-offres',
        loadComponent: () =>
          import('../../features/dashboard/supplier/mes-offres/mes-offres.page').then(m => m.MesOffresPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ─── TRANSPORTER ──────────────────────────────────────────────────────────
  {
    path: 'transporter',
    canActivate: [roleGuard],
    data: { roles: ['TRANSPORTER'] },
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../../features/dashboard/transporter/dashboard/transporter-dashboard.page').then(m => m.TransporterDashboardPage),
      },
      {
        path: 'mes-reseaux',
        loadComponent: () =>
          import('../../features/dashboard/transporter/mes-reseaux/mes-reseaux.page').then(m => m.MesReseauxPage),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('../../features/dashboard/transporter/course-detail/course-detail.page').then(m => m.CourseDetailPage),
      },
      {
        path: 'courses/:id/map',
        loadComponent: () =>
          import('../../features/dashboard/shared/livraison-map/livraison-map.page').then(m => m.LivraisonMapPage),
      },
      {
        path: 'mes-courses',
        loadComponent: () =>
          import('../../features/dashboard/transporter/mes-courses/mes-courses.page').then(m => m.MesCoursesPage),
      },
      {
        path: 'mes-tarifs',
        loadComponent: () =>
          import('../../features/dashboard/transporter/mes-tarifs/mes-tarifs.page').then(m => m.MesTarifsPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ─── DIRECT ACCESS (accessible à tous les rôles connectés) ────────────────
  {
    path: 'profil',
    loadComponent: () =>
      import('../../features/dashboard/shared/profil/profil.page').then(m => m.ProfilPage),
  },
  {
    path: 'profil/personal-info',
    loadComponent: () =>
      import('../../features/dashboard/shared/profil/personal-info/personal-info.page').then(m => m.PersonalInfoPage),
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('../../features/dashboard/shared/wallet/wallet.page').then(m => m.WalletPage),
  },
  {
    path: 'engins',
    loadComponent: () =>
      import('../../features/dashboard/shared/engins/engins.page').then(m => m.EnginsPage),
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('../../features/dashboard/admin/utilisateurs/utilisateurs.page').then(m => m.UtilisateursPage),
      },
      {
        path: 'partenariats',
        loadComponent: () =>
          import('../../features/dashboard/admin/partenariats/partenariats.page').then(m => m.PartenariatsPage),
      },
      {
        path: 'retraits',
        loadComponent: () =>
          import('../../features/dashboard/admin/retraits/retraits.page').then(m => m.RetraitsPage),
      },
      {
        path: '',
        redirectTo: 'utilisateurs',
        pathMatch: 'full',
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
