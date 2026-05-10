import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AuthStore } from '../../../core/services/api/auth/auth.store';
import { LoginDto } from '../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
  ],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private auth   = inject(AuthStore);
  private route  = inject(ActivatedRoute);

  /** Exposé au template pour le skeleton / bouton désactivé */
  readonly isLoading = this.auth.isLoading;

  /** Toggle visibilité mot de passe */
  readonly showPassword = signal(false);

  readonly form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto: LoginDto = this.form.getRawValue();

    this.auth.login(dto).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard/home';
        this.router.navigateByUrl(returnUrl);
      },
      // Les erreurs sont gérées par ErrorInterceptor (toast global)
    });
  }
}
