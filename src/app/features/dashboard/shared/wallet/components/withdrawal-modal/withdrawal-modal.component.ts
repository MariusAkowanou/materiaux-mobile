import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonSelect, IonSelectOption, IonInput, IonItem, IonSpinner,
} from '@ionic/angular/standalone';
import { PaymentMethod, WithdrawalCreate } from 'src/app/core/services/api/wallet/wallet.model';

@Component({
  selector: 'app-withdrawal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonSelect, IonSelectOption, IonInput, IonItem, IonSpinner,
  ],
  templateUrl: './withdrawal-modal.component.html',
})
export class WithdrawalModalComponent implements OnChanges {
  @Input({ required: true }) balance!: number;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() onSubmit  = new EventEmitter<WithdrawalCreate>();
  @Output() onDismiss = new EventEmitter<void>();

  readonly methods: { value: PaymentMethod; label: string; placeholder: string }[] = [
    { value: 'MOBILE_MONEY_MTN',  label: 'MTN Mobile Money',  placeholder: '+229 XX XX XX XX' },
    { value: 'MOBILE_MONEY_MOOV', label: 'Moov Money',        placeholder: '+229 XX XX XX XX' },
    { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire', placeholder: 'IBAN ou RIB' },
  ];

  form: FormGroup = new FormBuilder().group({
    amount:         [null, [Validators.required, Validators.min(500)]],
    payment_method: ['MOBILE_MONEY_MTN' as PaymentMethod, Validators.required],
    payment_details:['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnChanges() {
    if (this.balance != null) {
      this.form.get('amount')?.setValidators([
        Validators.required,
        Validators.min(500),
        Validators.max(this.balance),
      ]);
      this.form.get('amount')?.updateValueAndValidity();
    }
  }

  get selectedPlaceholder(): string {
    const method = this.form.get('payment_method')?.value as PaymentMethod;
    return this.methods.find((m) => m.value === method)?.placeholder ?? '';
  }

  dismiss() {
    this.form.reset({ payment_method: 'MOBILE_MONEY_MTN' });
    this.onDismiss.emit();
  }

  submit() {
    if (this.form.invalid) return;
    const { amount, payment_method, payment_details } = this.form.value;
    this.onSubmit.emit({
      amount: +amount,
      payment_method: payment_method as PaymentMethod,
      payment_details: payment_details!,
    });
  }

  fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}
