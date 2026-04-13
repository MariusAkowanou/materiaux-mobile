import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { QuoteResponse } from '../../../../../../../core/services/api/devis/devis.model';

@Component({
  selector: 'app-devis-recap',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="rounded-2xl overflow-hidden border border-orange-100 shadow-sm"
         style="background: linear-gradient(135deg, #fff9f5 0%, #fff 100%)">
      <div class="px-4 py-3 border-b border-orange-50 flex items-center gap-2">
        <i class="pi pi-receipt text-[16px]" style="color: var(--color-primary)"></i>
        <p class="text-[13px] font-bold text-gray-700">Récapitulatif du devis</p>
      </div>

      <div class="px-4 py-3 flex flex-col gap-2">

        <!-- Ligne matériau -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-box text-[13px] text-gray-400"></i>
            <span class="text-[13px] text-gray-500">
              Matériau ({{ quote().quantity }} {{ quote().product_name.split(' ')[0] }})
            </span>
          </div>
          <span class="text-[13px] font-semibold text-gray-700">
            {{ quote().material_cost | number:'1.0-0' }} FCFA
          </span>
        </div>

        <!-- Ligne transport -->
        @if (quote().transport_cost > 0) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-truck text-[13px] text-gray-400"></i>
              <span class="text-[13px] text-gray-500">Transport</span>
              @if (quote().distance_info) {
                <span class="text-[11px] text-gray-400">
                  ({{ quote().distance_info!.distance_text }})
                </span>
              }
            </div>
            <span class="text-[13px] font-semibold text-gray-700">
              {{ quote().transport_cost | number:'1.0-0' }} FCFA
            </span>
          </div>
        } @else {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-truck text-[13px] text-green-500"></i>
              <span class="text-[13px] text-green-600">Transport inclus</span>
            </div>
            <span class="text-[12px] font-semibold text-green-600">Offert</span>
          </div>
        }

        <!-- Séparateur -->
        <div class="h-px bg-orange-100 my-1"></div>

        <!-- Total -->
        <div class="flex items-center justify-between">
          <span class="text-[14px] font-bold text-gray-800">Total estimé</span>
          <div class="text-right">
            <p class="text-[20px] font-extrabold leading-tight" style="color: var(--color-primary)">
              {{ quote().total_price | number:'1.0-0' }}
            </p>
            <p class="text-[10px] text-gray-400">FCFA TTC</p>
          </div>
        </div>

        <!-- Validité -->
        <div class="mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50">
          <i class="pi pi-clock text-[12px] text-amber-500 flex-none"></i>
          <p class="text-[12px] text-amber-700">
            Devis valable
            @if (quote().time_remaining_h < 24) {
              encore <strong>{{ quote().time_remaining_h | number:'1.0-0' }}h</strong>
            } @else {
              jusqu'au {{ quote().expires_at | date:'d MMM à HH:mm' }}
            }
          </p>
        </div>

      </div>
    </div>
  `,
})
export class DevisRecapComponent {
  readonly quote = input.required<QuoteResponse>();
}
