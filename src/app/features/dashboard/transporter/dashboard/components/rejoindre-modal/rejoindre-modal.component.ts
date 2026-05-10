import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { CarriereDisponible } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-rejoindre-modal',
  standalone: true,
  imports: [CommonModule, IonSpinner],
  templateUrl: './rejoindre-modal.component.html',
})
export class RejoindreModalComponent {
  /**
   * Carrières déjà filtrées par le parent :
   *   – est_active === true
   *   – pas encore affiliées (non présentes dans reseauxIds)
   */
  @Input() carrieres: CarriereDisponible[] = [];
  @Input() isLoading    = false;
  @Input() isSubmitting = false;

  /** Fermer sans confirmer */
  @Output() onFermer    = new EventEmitter<void>();
  /** Confirmer l'adhésion avec la liste des IDs sélectionnés */
  @Output() onConfirmer = new EventEmitter<number[]>();

  // ── État local ────────────────────────────────────────────────────
  readonly searchQuery   = signal('');
  readonly selectedIds   = signal<Set<number>>(new Set());
  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly filteredCarrieres = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.carrieres;
    return this.carrieres.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.adresse_texte?.toLowerCase().includes(q),
    );
  });

  // ── Actions ───────────────────────────────────────────────────────

  toggleSelection(id: number): void {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  confirmer(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    this.onConfirmer.emit(ids);
    this._reset();
  }

  fermer(): void {
    this._reset();
    this.onFermer.emit();
  }

  private _reset(): void {
    this.selectedIds.set(new Set());
    this.searchQuery.set('');
  }
}
