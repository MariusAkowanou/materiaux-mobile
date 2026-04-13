import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonRippleEffect } from '@ionic/angular/standalone';
import { OffrePublique } from '../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-offre-card',
  standalone: true,
  imports: [IonRippleEffect, DecimalPipe],
  template: `
    <div class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <!-- Header fournisseur -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden flex-none">
          @if (offre().fournisseur.avatar_url) {
            <img [src]="offre().fournisseur.avatar_url" [alt]="offre().fournisseur.nom_entreprise"
                 class="w-full h-full object-cover" />
          } @else {
            <i class="pi pi-building text-[18px]" style="color: var(--color-primary)"></i>
          }
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-gray-800 truncate">
            {{ offre().fournisseur.nom_entreprise }}
          </p>
          @if (offre().fournisseur.ville) {
            <p class="text-[11px] text-gray-400 flex items-center gap-1">
              <i class="pi pi-map-marker text-[10px]"></i>
              {{ offre().fournisseur.ville }}
            </p>
          }
        </div>

        <!-- Note -->
        @if (offre().fournisseur.note_moyenne != null) {
          <div class="flex items-center gap-1 flex-none">
            <i class="pi pi-star-fill text-[12px] text-amber-400"></i>
            <span class="text-[12px] font-medium text-gray-600">
              {{ offre().fournisseur.note_moyenne | number:'1.1-1' }}
            </span>
          </div>
        }
      </div>

      <!-- Carrière + prix -->
      <div class="px-4 py-3 flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <!-- Carrière -->
          <div class="flex items-start gap-1.5 mb-2">
            <i class="pi pi-map-marker text-[12px] mt-0.5 flex-none" style="color: var(--color-primary)"></i>
            <div>
              <p class="text-[12px] font-medium text-gray-700">{{ offre().carriere.nom }}</p>
              @if (offre().carriere.commune) {
                <p class="text-[11px] text-gray-400">
                  {{ offre().carriere.commune }}
                  @if (offre().carriere.departement) {
                    · {{ offre().carriere.departement }}
                  }
                </p>
              }
              @if (offre().carriere.distance_km != null) {
                <p class="text-[11px] text-gray-400">
                  <i class="pi pi-send text-[10px]"></i>
                  {{ offre().carriere.distance_km | number:'1.0-1' }} km
                </p>
              }
            </div>
          </div>

          <!-- Métadonnées -->
          <div class="flex flex-wrap gap-2">
            @if (offre().stock_disponible != null) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                <i class="pi pi-check text-[9px]"></i>
                {{ offre().stock_disponible }} {{ offre().unite }} dispo.
              </span>
            }
            @if (offre().delai_livraison_jours != null) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
                <i class="pi pi-clock text-[9px]"></i>
                {{ offre().delai_livraison_jours }}j livraison
              </span>
            }
          </div>
        </div>

        <!-- Prix + CTA -->
        <div class="flex-none flex flex-col items-end gap-2">
          <div class="text-right">
            <p class="text-[18px] font-extrabold leading-tight" style="color: var(--color-primary)">
              {{ offre().prix_unitaire | number:'1.0-0' }}
            </p>
            <p class="text-[10px] text-gray-400">FCFA / {{ offre().unite }}</p>
          </div>

          <button
            ion-activatable
            class="relative overflow-hidden px-4 py-2 rounded-xl text-[12px] font-semibold text-white
                   active:scale-95 transition-transform duration-150"
            style="background: var(--color-primary)"
            (click)="requestQuote.emit(offre())"
          >
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  `,
})
export class OffreCardComponent {
  readonly offre        = input.required<OffrePublique>();
  readonly requestQuote = output<OffrePublique>();
}
