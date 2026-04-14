import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthStore } from '../../../core/services/api/auth/auth.store';
import { VerifyOtpDto } from '../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html', 
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent
],
})
export class VerifyOtpPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly isLoading = this.authStore.isLoading;

  readonly form: FormGroup = this.fb.group({
    otp_code: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern(/^[0-9]*$/)
    ]],
  });

  get otpCode() { return this.form.get('otp_code')!; }

  submit() {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: VerifyOtpDto = this.form.value;

    this.authStore.verifyOtp(dto).subscribe({
      next: () => {
        // Redirection vers le dashboard après vérification réussie
        this.router.navigate(['/dashboard/home']);
      },
    });
  }

  resendOtp() {
    // Logique de renvoi à implémenter si disponible côté backend
    console.log('Resend OTP triggered');
  }
}
