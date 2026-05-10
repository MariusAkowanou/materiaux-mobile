import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { OffreDisponible } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-offre-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonSpinner],
  templateUrl: './offre-card.component.html',
})
export class OffreCardComponent {
  @Input({ required: true }) offre!: OffreDisponible;
  @Input() isSubmitting = false;

  /** Émettre pour accepter la course */
  @Output() onAccepter    = new EventEmitter<OffreDisponible>();
  /** Émettre pour voir le détail */
  @Output() onVoirDetail  = new EventEmitter<OffreDisponible>();
}
