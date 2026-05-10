import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauMembership } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-reseau-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reseau-widget.component.html',
})
export class ReseauWidgetComponent {

  /** Liste complète des réseaux passée par le parent */
  @Input() set reseaux(value: ReseauMembership[]) {
    this._reseaux = value;
  }
  get reseaux(): ReseauMembership[] { return this._reseaux; }
  private _reseaux: ReseauMembership[] = [];

  /** Les 3 premiers à afficher */
  get reseauxAffiches(): ReseauMembership[] {
    return this._reseaux.slice(0, 3);
  }

  /** Nombre de réseaux supplémentaires non affichés */
  get surplus(): number {
    return Math.max(0, this._reseaux.length - 3);
  }

  /** Émettre pour ouvrir la modal rejoindre */
  @Output() onRejoindre  = new EventEmitter<void>();
  /** Émettre pour naviguer vers la page liste complète */
  @Output() onVoirTous   = new EventEmitter<void>();
  /** Émettre pour quitter un réseau (passe l'id carrière) */
  @Output() onQuitter    = new EventEmitter<number>();

  nomCarriere(r: ReseauMembership): string {
    return r.carriere?.nom ?? r.carriere_nom ?? `Carrière #${r.carriere_id}`;
  }
}
