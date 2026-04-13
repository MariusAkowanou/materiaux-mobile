import { Component, input, output } from '@angular/core';
import { IonRippleEffect } from '@ionic/angular/standalone';
import { DecimalPipe } from '@angular/common';
import { MateriauBase } from '../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-materiau-card',
  standalone: true,
  imports: [IonRippleEffect, DecimalPipe],
  template: `
    <button
      ion-activatable
      class="relative overflow-hidden w-full text-left rounded-2xl bg-white
             border border-gray-100 shadow-sm
             active:scale-[0.98] transition-transform duration-150"
      (click)="select.emit(materiau())"
    >
      <div class="flex gap-3 p-3">
        <!-- Vignette image -->
        <div class="flex-none w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-surface)]
                    flex items-center justify-center">
          @if (primaryImage()) {
            <img
              [src]="primaryImage()"
              [alt]="materiau().nom"
              class="w-full h-full object-cover"
            />
          } @else {
            <i class="pi pi-box text-[24px]" style="color: var(--color-primary)"></i>
          }
        </div>

        <!-- Infos -->
        <div class="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <p class="text-[14px] font-semibold text-gray-800 truncate">{{ materiau().nom }}</p>

          @if (materiau().description) {
            <p class="text-[12px] text-gray-400 line-clamp-1">{{ materiau().description }}</p>
          }

          <div class="flex items-center gap-2 mt-0.5">
            <!-- Prix indicatif -->
            @if (materiau().prix_indicatif_min != null) {
              <span class="text-[12px] font-medium" style="color: var(--color-primary)">
                À partir de {{ materiau().prix_indicatif_min | number:'1.0-0' }} FCFA / {{ materiau().unite }}
              </span>
            } @else {
              <span class="text-[12px] text-gray-400">Prix sur devis</span>
            }
          </div>
        </div>

        <!-- Chevron -->
        <div class="flex-none flex items-center">
          <i class="pi pi-chevron-right text-[13px] text-gray-300"></i>
        </div>
      </div>

      <!-- Badge transport inclus -->
      @if (materiau().categorie.transport_inclus) {
        <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400 opacity-70"></div>
      }
    </button>
  `,
})
export class MateriauCardComponent {
  readonly materiau = input.required<MateriauBase>();
  readonly select   = output<MateriauBase>();

  protected primaryImage(): string | null {
    return this.materiau().images.find((i) => i.is_primary)?.url
      ?? this.materiau().images[0]?.url
      ?? null;
  }
}
