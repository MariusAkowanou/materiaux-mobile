import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner } from '@ionic/angular/standalone';
import { CreateDisputeDto, DisputeCategory } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-dispute-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSpinner],
  templateUrl: './dispute-modal.component.html',
})
export class DisputeModalComponent {
  @Output() submitted = new EventEmitter<CreateDisputeDto>();
  @Output() dismissed = new EventEmitter<void>();

  readonly isSubmitting = signal(false);

  readonly categories: { value: DisputeCategory; label: string; icon: string }[] = [
    { value: 'QUANTITE_MANQUANTE',  label: 'Quantité manquante',   icon: 'pi-box' },
    { value: 'QUALITE_INSUFFISANTE', label: 'Qualité insuffisante', icon: 'pi-star' },
    { value: 'LIVRAISON_INCORRECTE', label: 'Livraison incorrecte', icon: 'pi-truck' },
    { value: 'AUTRE',               label: 'Autre',                icon: 'pi-info-circle' },
  ];

  category: DisputeCategory = 'QUANTITE_MANQUANTE';
  reason = '';

  get isValid(): boolean {
    return this.reason.trim().length >= 10;
  }

  submit(): void {
    if (!this.isValid) return;
    this.isSubmitting.set(true);
    this.submitted.emit({ category: this.category, reason: this.reason.trim() });
  }

  close(): void {
    this.dismissed.emit();
  }
}
