import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MateriauListItem } from '../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-materiau-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <button
      class="relative overflow-hidden w-full text-left rounded-2xl bg-white
             border border-gray-100 shadow-sm flex flex-col
             active:scale-[0.97] transition-all duration-150 hover:shadow-md"
      (click)="select.emit(materiau())"
    >
      <!-- Image / Icône -->
      <div class="w-full aspect-square overflow-hidden rounded-t-2xl flex items-center justify-center"
           [style.background]="materiau().image_principale ? 'transparent' : iconBg()">
        @if (materiau().image_principale) {
          <img
            [src]="materiau().image_principale"
            [alt]="materiau().nom"
            class="w-full h-full object-cover"
          />
        } @else {
          <i class="pi pi-box text-[40px]" [style.color]="iconColor()"></i>
        }
      </div>

      <!-- Infos -->
      <div class="flex flex-col gap-1 p-2.5 flex-1">
        <p class="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2">
          {{ materiau().nom }}
        </p>

        <!-- Prix -->
        @if (materiau().prix_min != null) {
          <div class="flex items-baseline gap-0.5 mt-auto pt-1">
            <span class="text-[11px] text-gray-400">dès</span>
            <span class="text-[13px] font-extrabold" style="color: var(--ion-color-primary)">
              {{ materiau().prix_min | number:'1.0-0' }}
            </span>
            <span class="text-[10px] text-gray-400">F/{{ materiau().unite_vente }}</span>
          </div>
        } @else {
          <p class="text-[11px] text-gray-400 italic mt-auto pt-1">Prix sur devis</p>
        }

        <!-- Badge transport + nb offres -->
        <div class="flex items-center gap-1.5 flex-wrap mt-1">
          @if (materiau().transport_inclus) {
            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full
                         bg-emerald-50 text-emerald-600 text-[9px] font-bold">
              <i class="pi pi-truck text-[8px]"></i> inclus
            </span>
          }
          @if (materiau().nb_offres_actives > 0) {
            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full
                         bg-blue-50 text-blue-600 text-[9px] font-bold">
              {{ materiau().nb_offres_actives }} offre{{ materiau().nb_offres_actives > 1 ? 's' : '' }}
            </span>
          }
        </div>
      </div>

      <!-- Barre transport inclus -->
      @if (materiau().transport_inclus) {
        <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-b-2xl"></div>
      }
    </button>
  `,
})
export class MateriauCardComponent {
  readonly materiau = input.required<MateriauListItem>();
  readonly select   = output<MateriauListItem>();

  protected iconBg(): string {
    const palette = [
      '#FBE9DF', '#FEF3C7', '#F0F4FF', '#ECFDF5',
      '#FFF7ED', '#EFF6FF', '#F5F3FF', '#FDF2F8',
    ];
    return palette[this.materiau().id % palette.length];
  }

  protected iconColor(): string {
    const palette = [
      '#EA580C', '#D97706', '#4338CA', '#16A34A',
      '#B45309', '#0284C7', '#7C3AED', '#DB2777',
    ];
    return palette[this.materiau().id % palette.length];
  }
}
