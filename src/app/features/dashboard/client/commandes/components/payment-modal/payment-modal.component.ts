import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonInput, IonSpinner, IonItem,
} from '@ionic/angular/standalone';
import { OrderResponse } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonInput, IonSpinner, IonItem,
  ],
  templateUrl: './payment-modal.component.html',
})
export class PaymentModalComponent {
  @Input({ required: true }) order!: OrderResponse;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() onSubmit  = new EventEmitter<string>(); // émet le numéro de téléphone
  @Output() onDismiss = new EventEmitter<void>();

  form: FormGroup = new FormBuilder().group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
  });

  dismiss() {
    this.form.reset();
    this.onDismiss.emit();
  }

  submit() {
    if (this.form.invalid) return;
    this.onSubmit.emit(this.form.value.phone!);
  }

  get phoneInvalid(): boolean {
    const ctrl = this.form.get('phone');
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
