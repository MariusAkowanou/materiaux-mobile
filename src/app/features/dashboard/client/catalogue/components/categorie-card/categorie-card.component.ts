import { Component, input, output } from '@angular/core';
import { IonRippleEffect } from '@ionic/angular/standalone';
import { Categorie } from '../../../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-categorie-card',
  standalone: true,
  imports: [IonRippleEffect],
  template: `
    <button
      ion-activatable
      class="relative overflow-hidden flex flex-col items-center justify-center gap-2
             w-full aspect-square rounded-2xl border-2
             active:scale-95 transition-all duration-150"
      [style.background]="selected() ? 'var(--ion-color-primary)' : (categorie().image_url ? 'none' : bgColor())"
      [style.border-color]="selected() ? 'var(--ion-color-primary)' : 'transparent'"
      [style.box-shadow]="selected() ? '0 4px 14px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)'"
      (click)="select.emit(categorie())"
    >
      <!-- Image de fond optionnelle -->
      @if (categorie().image_url && !selected()) {
        <img
          [src]="categorie().image_url"
          [alt]="categorie().nom"
          class="absolute inset-0 w-full h-full object-cover rounded-2xl"
        />
        <div class="absolute inset-0 rounded-2xl bg-black/35"></div>
      }

      <!-- Icône -->
      <span class="relative z-10 flex items-center justify-center w-11 h-11 rounded-2xl"
            [style.background]="selected() ? 'rgba(255,255,255,0.2)' : iconBg()"
            [style.color]="selected() || categorie().image_url ? '#fff' : iconColor()">
        <i class="pi text-[24px] leading-none" [class]="categorie().icon_name ?? 'pi-box'"></i>
      </span>

      <!-- Nom -->
      <span class="relative z-10 text-[11px] font-bold text-center leading-tight px-1.5 line-clamp-2"
            [style.color]="selected() || categorie().image_url ? '#fff' : '#374151'">
        {{ categorie().nom }}
      </span>

      <!-- Nb matériaux -->
      @if (categorie().materiaux_count > 0 && !selected()) {
        <span class="relative z-10 text-[9px] font-medium opacity-60"
              [style.color]="categorie().image_url ? '#fff' : '#6b7280'">
          {{ categorie().materiaux_count }} matériaux
        </span>
      }

      <!-- Badge transport inclus -->
      @if (categorie().transport_inclus) {
        <span class="absolute top-1.5 right-1.5 z-10 flex items-center justify-center
                     w-5 h-5 rounded-full bg-emerald-500 shadow-sm">
          <i class="pi pi-truck text-[8px] text-white leading-none"></i>
        </span>
      }

      <!-- Check si sélectionné -->
      @if (selected()) {
        <span class="absolute top-1.5 left-1.5 z-10 flex items-center justify-center
                     w-5 h-5 rounded-full bg-white/30">
          <i class="pi pi-check text-[9px] text-white leading-none"></i>
        </span>
      }

      <ion-ripple-effect></ion-ripple-effect>
    </button>
  `,
})
export class CategorieCardComponent {
  readonly categorie = input.required<Categorie>();
  readonly selected  = input<boolean>(false);
  readonly select    = output<Categorie>();

  protected bgColor(): string {
    const palette = [
      '#FBE9DF', '#FEF3C7', '#F0F4FF', '#ECFDF5',
      '#FFF7ED', '#EFF6FF', '#F5F3FF', '#FDF2F8',
    ];
    return palette[this.categorie().id % palette.length];
  }

  protected iconBg(): string {
    const palette = [
      'rgba(234,88,12,0.12)', 'rgba(217,119,6,0.12)', 'rgba(67,56,202,0.12)', 'rgba(22,163,74,0.12)',
      'rgba(180,83,9,0.12)',  'rgba(2,132,199,0.12)',  'rgba(124,58,237,0.12)', 'rgba(219,39,119,0.12)',
    ];
    return palette[this.categorie().id % palette.length];
  }

  protected iconColor(): string {
    const palette = [
      '#EA580C', '#D97706', '#4338CA', '#16A34A',
      '#B45309', '#0284C7', '#7C3AED', '#DB2777',
    ];
    return palette[this.categorie().id % palette.length];
  }
}
