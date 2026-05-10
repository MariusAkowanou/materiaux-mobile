import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonCard, IonCardContent, IonButton, IonBadge } from '@ionic/angular/standalone';
import { Tarif } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-tarif-card',
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonBadge, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="rounded-2xl shadow-sm mx-0 my-0">
      <ion-card-content class="p-4">
        <div class="flex items-center gap-3">

          <!-- Icône camion -->
          <div
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style="background: color-mix(in srgb, var(--ion-color-primary) 10%, white);"
          >
            <i class="pi pi-truck text-2xl" style="color: var(--ion-color-primary);"></i>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-800 m-0 truncate">{{ tarif.camion_libelle }}</p>
            <p class="text-xs text-gray-500 m-0 mt-0.5">
              {{ tarif.camion_capacite_m3 }} m³
            </p>
          </div>

          <!-- Mode + prix -->
          <div class="flex flex-col items-end gap-1  flex-shrink-0">
            <ion-badge [color]="tarif.mode_tarif === 'km' ? 'tertiary' : 'secondary'" class="text-[10px] !p-1">
              {{ tarif.mode_tarif === 'km' ? 'Par km' : 'Par voyage' }}
            </ion-badge>
            <span class="text-base font-bold" style="color: var(--ion-color-primary)">
              {{ tarif.prix | number:'1.0-0' }} FCFA
            </span>
          </div>

          <!-- Supprimer -->
          <ion-button
            fill="clear"
            color="danger"
            size="small"
            (click)="onDelete.emit(tarif)"
            class="-mr-2"
          >
            <i class="pi pi-trash text-base"></i>
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
})
export class TarifCardComponent {
  @Input({ required: true }) tarif!: Tarif;
  @Output() onDelete = new EventEmitter<Tarif>();
}
