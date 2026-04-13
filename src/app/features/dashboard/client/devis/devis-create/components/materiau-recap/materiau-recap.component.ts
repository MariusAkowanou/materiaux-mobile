import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OffrePublique } from '../../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-materiau-recap',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <i class="pi pi-box text-[16px]" style="color: var(--color-primary)"></i>
        <p class="text-[13px] font-bold text-gray-700">Matériau sélectionné</p>
      </div>
      <div class="px-4 py-3 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-none">
          <i class="pi pi-building text-[18px]" style="color: var(--color-primary)"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-semibold text-gray-800 truncate">
            {{ offre().fournisseur.nom_entreprise }}
          </p>
          <p class="text-[12px] text-gray-400 truncate">
            <i class="pi pi-map-marker text-[10px]"></i>
            {{ offre().carriere.nom }}
            @if (offre().carriere.commune) {
              · {{ offre().carriere.commune }}
            }
          </p>
        </div>
        <div class="text-right flex-none">
          <p class="text-[16px] font-extrabold" style="color: var(--color-primary)">
            {{ offre().prix_unitaire | number:'1.0-0' }}
          </p>
          <p class="text-[10px] text-gray-400">FCFA / {{ offre().unite }}</p>
        </div>
      </div>
    </div>
  `,
})
export class MateriauRecapComponent {
  readonly offre = input.required<OffrePublique>();
}
