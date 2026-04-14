import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthStore } from '../../../../core/services/api/auth/auth.store';

@Component({
  selector: 'app-profil.page',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, RouterLink],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="[--background:transparent] px-2">
        <ion-title class="font-bold text-gray-900 text-2xl tracking-tight">Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-gray-50">
      <div class="flex flex-col gap-6 px-4 py-6">
        
        <!-- Section Mon Compte -->
        <div class="flex flex-col gap-2">
          <span class="px-2 text-xs font-black uppercase tracking-widest text-gray-400">
            Mon Compte
          </span>
          <div class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
            
            <a routerLink="personal-info" class="group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 active:bg-gray-100">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-primary group-hover:text-white">
                  <i class="pi pi-user text-lg"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Informations personnelles</span>
                  <span class="text-xs font-medium text-gray-400">Gérer vos détails et contacts</span>
                </div>
              </div>
              <i class="pi pi-chevron-right text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary"></i>
            </a>

            <div class="h-px bg-gray-100 mx-4"></div>

            <a class="group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <i class="pi pi-lock text-lg"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Sécurité & Mot de passe</span>
                  <span class="text-xs font-medium text-gray-400">Modifier votre mot de passe</span>
                </div>
              </div>
              <i class="pi pi-chevron-right text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"></i>
            </a>

          </div>
        </div>

        <!-- Section Paramètres -->
        <div class="flex flex-col gap-2">
          <span class="px-2 text-xs font-black uppercase tracking-widest text-gray-400">
            Paramètres
          </span>
          <div class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
            
            <a class="group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-500 group-hover:text-white">
                  <i class="pi pi-bell text-lg"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Notifications</span>
                  <span class="text-xs font-medium text-gray-400">Préférences d'alertes</span>
                </div>
              </div>
              <i class="pi pi-chevron-right text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-green-500"></i>
            </a>

            <div class="h-px bg-gray-100 mx-4"></div>

            <a class="group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <i class="pi pi-question-circle text-lg"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">Aide & Support</span>
                  <span class="text-xs font-medium text-gray-400">Contactez-nous</span>
                </div>
              </div>
              <i class="pi pi-chevron-right text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-purple-500"></i>
            </a>

          </div>
        </div>

        <!-- Logout Button -->
        <div class="mt-4 flex flex-col px-2">
          <button (click)="logout()" class="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-50 py-4 text-sm font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-100 active:scale-95 border-2 border-red-100 hover:border-red-200 shadow-sm shadow-red-100">
            <i class="pi pi-power-off text-lg"></i>
            <span>Se déconnecter</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="mb-6 flex justify-center text-center">
          <p class="text-[10px] font-bold uppercase tracking-widest text-gray-300">
            Matériaux Express v1.0.0
          </p>
        </div>

      </div>
    </ion-content>
  `,
})
export class ProfilPage {
  private authStore = inject(AuthStore);

  logout() {
    this.authStore.logout();
  }
}
