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
             w-full aspect-square rounded-2xl border border-white/60
             shadow-sm active:scale-95 transition-transform duration-150"
      [class.ring-2]="selected()"
      [class.ring-offset-2]="selected()"
      [style.background]="categorie().image_url ? 'none' : bgColor()"
      [style.--tw-ring-color]="'var(--color-primary)'"
      (click)="select.emit(categorie())"
    >
      <!-- Image de fond optionnelle -->
      @if (categorie().image_url) {
        <img
          [src]="categorie().image_url"
          [alt]="categorie().nom"
          class="absolute inset-0 w-full h-full object-cover rounded-2xl"
        />
        <div class="absolute inset-0 rounded-2xl bg-black/30"></div>
      }

      <!-- Icône -->
      <span class="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl"
            [style.color]="categorie().image_url ? '#fff' : iconColor()">
        <i class="pi text-[26px] leading-none" [class]="categorie().icon_name ?? 'pi-box'"></i>
      </span>

      <!-- Nom -->
      <span class="relative z-10 text-[11px] font-semibold text-center leading-tight px-1.5 line-clamp-2"
            [style.color]="categorie().image_url ? '#fff' : iconColor()">
        {{ categorie().nom }}
      </span>

      <!-- Badge transport inclus -->
      @if (categorie().transport_inclus) {
        <span class="absolute top-1.5 right-1.5 z-10 flex items-center justify-center
                     w-5 h-5 rounded-full bg-green-500/90">
          <i class="pi pi-truck text-[9px] text-white leading-none"></i>
        </span>
      }
    </button>
  `,
})
export class CategorieCardComponent {
  readonly categorie = input.required<Categorie>();
  readonly selected  = input<boolean>(false);
  readonly select    = output<Categorie>();

  protected bgColor(): string {
    const palette = [
      '#FBE9DF', '#FEF9EE', '#F0F0F0', '#EEF2FF',
      '#FFF7ED', '#F0F9FF', '#F0FDF4', '#FDF2F8',
    ];
    return palette[this.categorie().id % palette.length];
  }

  protected iconColor(): string {
    const palette = [
      'var(--color-primary)', '#D97706', '#6B7280', '#4338CA',
      '#B45309', '#0284C7', '#16A34A', '#9333EA',
    ];
    return palette[this.categorie().id % palette.length];
  }
}
