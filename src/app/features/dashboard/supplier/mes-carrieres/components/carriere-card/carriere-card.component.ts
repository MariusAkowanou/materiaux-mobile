import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonBadge, IonButton } from '@ionic/angular/standalone';
import { Carriere } from 'src/app/core/services/api/materiaux/materiaux.model';

@Component({
  selector: 'app-carriere-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonCard, IonCardContent, IonBadge, IonButton],
  templateUrl: './carriere-card.component.html',
})
export class CarriereCardComponent {
  @Input({ required: true }) carriere!: Carriere;

  @Output() onEdit   = new EventEmitter<Carriere>();
  @Output() onDelete = new EventEmitter<Carriere>();
}
