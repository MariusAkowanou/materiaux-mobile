import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OffrePublique } from '../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-offre-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">

      <!-- Header fournisseur -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center
                    overflow-hidden flex-none border border-gray-100">
          @if (offre().fournisseur.avatar_url) {
            <img [src]="offre().fournisseur.avatar_url"
                 [alt]="offre().fournisseur.nom_entreprise"
                 class="w-full h-full object-cover" />
          } @else {
            <i class="pi pi-building text-[18px]" style="color: var(--ion-color-primary)"></i>
          }
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-gray-800 truncate">
            {{ offre().fournisseur.nom_entreprise }}
          </p>
          @if (offre().fournisseur.ville) {
            <p class="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <i class="pi pi-map-marker text-[10px]"></i>
              {{ offre().fournisseur.ville }}
            </p>
          }
        </div>

        <!-- Note moyenne -->
        @if (offre().fournisseur.note_moyenne != null) {
          <div class="flex items-center gap-1 flex-none bg-amber-50 px-2 py-1 rounded-lg">
            <i class="pi pi-star-fill text-[11px] text-amber-400"></i>
            <span class="text-[12px] font-bold text-amber-700">
              {{ offre().fournisseur.note_moyenne | number:'1.1-1' }}
            </span>
          </div>
        }
      </div>

      <!-- Carrière + prix -->
      <div class="px-4 py-3.5 flex items-start justify-between gap-3">

        <div class="flex-1 min-w-0">
          <!-- Localisation carrière -->
          <div class="flex items-start gap-2 mb-2.5">
            <span class="flex-none w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                  style="background: color-mix(in srgb, var(--ion-color-primary) 10%, white);">
              <i class="pi pi-map-marker text-[11px]" style="color: var(--ion-color-primary)"></i>
            </span>
            <div>
              <p class="text-[12px] font-semibold text-gray-700 leading-snug">{{ offre().carriere.nom }}</p>
              @if (offre().carriere.commune) {
                <p class="text-[11px] text-gray-400 mt-0.5">
                  {{ offre().carriere.commune }}
                  @if (offre().carriere.departement) { · {{ offre().carriere.departement }} }
                </p>
              }
              @if (offre().carriere.distance_km != null) {
                <p class="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <i class="pi pi-send text-[9px]"></i>
                  {{ offre().carriere.distance_km | number:'1.0-1' }} km de vous
                </p>
              }
            </div>
          </div>

          <!-- Badges stock / délai -->
          <div class="flex flex-wrap gap-1.5">
            @if (offre().stock_disponible != null) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                           bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                <i class="pi pi-check text-[9px]"></i>
                {{ offre().stock_disponible }} {{ offre().unite }} en stock
              </span>
            }
            @if (offre().delai_livraison_jours != null) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                           bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                <i class="pi pi-clock text-[9px]"></i>
                {{ offre().delai_livraison_jours }}j livraison
              </span>
            }
          </div>
        </div>

        <!-- Prix + CTA -->
        <div class="flex-none flex flex-col items-end gap-2.5">
          <div class="text-right">
            <p class="text-[22px] font-extrabold leading-none"
               style="color: var(--ion-color-primary)">
              {{ offre().prix_unitaire | number:'1.0-0' }}
            </p>
            <p class="text-[10px] text-gray-400 mt-0.5">FCFA / {{ offre().unite }}</p>
          </div>

          <button
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold
                   border-2 transition-all duration-150 active:scale-95"
            style="color: var(--ion-color-primary);
                   border-color: var(--ion-color-primary);
                   background: color-mix(in srgb, var(--ion-color-primary) 6%, white);"
            (click)="requestQuote.emit(offre())"
          >
            <i class="pi pi-file-edit text-[11px]"></i>
            Choisir
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
