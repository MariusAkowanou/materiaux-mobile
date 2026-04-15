import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonBadge, IonButton } from '@ionic/angular/standalone';
import { OffreFournisseur, OffreStatut } from 'src/app/core/services/api/materiaux/materiaux.model';

@Component({
  selector: 'app-offre-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonCard, IonCardContent, IonBadge, IonButton],
  templateUrl: './offre-card.component.html',
})
export class OffreCardComponent {
  @Input({ required: true }) offre!: OffreFournisseur;

  @Output() onEdit      = new EventEmitter<OffreFournisseur>();
  @Output() onToggle    = new EventEmitter<{ offre: OffreFournisseur; statut: OffreStatut }>();
  @Output() onDelete    = new EventEmitter<OffreFournisseur>();

  statutLabel(s: OffreStatut): string {
    return { ACTIVE: 'Active', EN_RUPTURE: 'En rupture', ARCHIVEE: 'Archivée' }[s] ?? s;
  }

  statutColor(s: OffreStatut): string {
    return { ACTIVE: 'success', EN_RUPTURE: 'warning', ARCHIVEE: 'medium' }[s] ?? 'medium';
  }

  get nextStatut(): OffreStatut {
    return this.offre.statut === 'ACTIVE' ? 'EN_RUPTURE' : 'ACTIVE';
  }

  get toggleLabel(): string {
    return this.offre.statut === 'ACTIVE' ? 'Mettre en rupture' : 'Remettre en vente';
  }
}
