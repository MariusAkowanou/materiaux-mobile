import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { AuthStore } from '../../../../core/services/api/auth/auth.store';
import { UserRole } from '../../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [IonContent, IonHeader],
  templateUrl: './profil.page.html',
})
export class ProfilPage {
  private authStore = inject(AuthStore);
  private router    = inject(Router);

  readonly user        = this.authStore.currentUser;
  readonly primaryRole = this.authStore.primaryRole;

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
  });

  roleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      CLIENT:       'Client',
      COMPANY:      'Entreprise',
      SUPPLIER:     'Fournisseur',
      TRANSPORTER:  'Transporteur',
      ADMIN:        'Administrateur',
      COLLABORATOR: 'Collaborateur',
    };
    return map[role] ?? role;
  }

  goToWallet()       { this.router.navigateByUrl('/dashboard/wallet'); }
  goToPersonalInfo() { this.router.navigateByUrl('/dashboard/profil/personal-info'); }

  logout() { this.authStore.logout(); }
}
