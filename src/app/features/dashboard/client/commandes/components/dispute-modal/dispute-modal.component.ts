import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
} from '@ionic/angular/standalone';
import { DisputeCategory, OrderResponse, CreateDisputeDto } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-dispute-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
  ],
  templateUrl: './dispute-modal.component.html',
})
export class DisputeModalComponent {
  @Input({ required: true }) order!: OrderResponse;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() onSubmit  = new EventEmitter<CreateDisputeDto>();
  @Output() onDismiss = new EventEmitter<void>();

  readonly categories: { value: DisputeCategory; label: string }[] = [
    { value: 'QUANTITE_MANQUANTE',  label: 'Quantité manquante'   },
    { value: 'QUALITE_INSUFFISANTE', label: 'Qualité insuffisante' },
    { value: 'LIVRAISON_INCORRECTE', label: 'Livraison incorrecte' },
    { value: 'AUTRE',               label: 'Autre'                },
  ];

  form: FormGroup = new FormBuilder().group({
    reason:   ['', [Validators.required, Validators.minLength(10)]],
    category: ['QUANTITE_MANQUANTE' as DisputeCategory, Validators.required],
  });

  dismiss() {
    this.form.reset({ category: 'QUANTITE_MANQUANTE' });
    this.onDismiss.emit();
  }

  submit() {
    if (this.form.invalid) return;
    const { reason, category } = this.form.value;
    this.onSubmit.emit({ reason: reason!, category: category as DisputeCategory });
  }

  get reasonInvalid(): boolean {
    const ctrl = this.form.get('reason');
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
