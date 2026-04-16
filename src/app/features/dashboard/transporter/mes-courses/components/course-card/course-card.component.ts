import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonCard, IonCardContent, IonBadge, IonButton,
} from '@ionic/angular/standalone';
import { Course, CourseStatut } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [IonCard, IonCardContent, IonBadge, IonButton, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="rounded-2xl shadow-sm mx-0 my-0">
      <ion-card-content class="p-4 flex flex-col gap-3">

        <!-- En-tête : numéro + badge statut -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-gray-400 font-medium">#{{ course.order_number }}</span>
            <span class="text-base font-bold text-gray-800">{{ course.product_name }}</span>
            <span class="text-sm text-gray-500">{{ course.client_nom }}</span>
          </div>
          <ion-badge [color]="badgeColor" class="text-[10px] flex-shrink-0">
            {{ statutLabel }}
          </ion-badge>
        </div>

        <!-- Trajet -->
        <div class="flex flex-col gap-1 bg-gray-50 rounded-xl p-3">
          <div class="flex items-start gap-2">
            <i class="pi pi-map-marker text-green-500 text-sm mt-0.5 flex-shrink-0"></i>
            <span class="text-xs text-gray-600 leading-relaxed">{{ course.adresse_depart }}</span>
          </div>
          <div class="flex items-center gap-2 pl-0.5">
            <div class="w-3.5 flex justify-center">
              <div class="h-4 w-px bg-gray-300"></div>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <i class="pi pi-flag text-red-500 text-sm mt-0.5 flex-shrink-0"></i>
            <span class="text-xs text-gray-600 leading-relaxed">{{ course.adresse_arrivee }}</span>
          </div>
        </div>

        <!-- Infos chiffrées -->
        <div class="flex gap-3">
          @if (course.distance_km) {
            <div class="flex items-center gap-1.5">
              <i class="pi pi-map text-gray-400 text-xs"></i>
              <span class="text-xs text-gray-600">{{ course.distance_km | number:'1.0-1' }} km</span>
            </div>
          }
          <div class="flex items-center gap-1.5">
            <i class="pi pi-truck text-gray-400 text-xs"></i>
            <span class="text-xs text-gray-600">{{ course.nb_voyages }} voyage{{ course.nb_voyages > 1 ? 's' : '' }}</span>
          </div>
          @if (course.camion_libelle) {
            <div class="flex items-center gap-1.5">
              <i class="pi pi-box text-gray-400 text-xs"></i>
              <span class="text-xs text-gray-600">{{ course.camion_libelle }}</span>
            </div>
          }
        </div>

        <!-- Prix + action -->
        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          @if (course.prix_transport) {
            <span class="text-base font-bold" style="color: var(--ion-color-primary)">
              {{ course.prix_transport | number:'1.0-0' }} FCFA
            </span>
          } @else {
            <span class="text-sm text-gray-400">Prix non défini</span>
          }

          @if (nextStatut) {
            <ion-button
              fill="solid"
              size="small"
              [color]="actionColor"
              (click)="onChangeStatut.emit({ course: course, statut: nextStatut! })"
              class="rounded-xl"
            >
              <i [class]="'pi ' + actionIcon + ' mr-1 text-sm'"></i>
              {{ actionLabel }}
            </ion-button>
          }
        </div>

      </ion-card-content>
    </ion-card>
  `,
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
  @Output() onChangeStatut = new EventEmitter<{ course: Course; statut: CourseStatut }>();

  get nextStatut(): CourseStatut | null {
    switch (this.course.statut) {
      case 'EN_ATTENTE': return 'ASSIGNEE';
      case 'ASSIGNEE':   return 'EN_COURS';
      case 'EN_COURS':   return 'LIVREE';
      default:           return null;
    }
  }

  get statutLabel(): string {
    const map: Record<CourseStatut, string> = {
      EN_ATTENTE: 'En attente',
      ASSIGNEE:   'Assignée',
      EN_COURS:   'En cours',
      LIVREE:     'Livrée',
    };
    return map[this.course.statut];
  }

  get badgeColor(): string {
    const map: Record<CourseStatut, string> = {
      EN_ATTENTE: 'warning',
      ASSIGNEE:   'primary',
      EN_COURS:   'tertiary',
      LIVREE:     'success',
    };
    return map[this.course.statut];
  }

  get actionLabel(): string {
    switch (this.course.statut) {
      case 'EN_ATTENTE': return 'Accepter';
      case 'ASSIGNEE':   return 'Démarrer';
      case 'EN_COURS':   return 'Livrer';
      default:           return '';
    }
  }

  get actionColor(): string {
    switch (this.course.statut) {
      case 'EN_ATTENTE': return 'primary';
      case 'ASSIGNEE':   return 'tertiary';
      case 'EN_COURS':   return 'success';
      default:           return 'medium';
    }
  }

  get actionIcon(): string {
    switch (this.course.statut) {
      case 'EN_ATTENTE': return 'pi-check';
      case 'ASSIGNEE':   return 'pi-play';
      case 'EN_COURS':   return 'pi-check-circle';
      default:           return '';
    }
  }
}
