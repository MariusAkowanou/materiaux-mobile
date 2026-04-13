import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthStore } from '../../../core/services/api/auth/auth.store';
import { UserRole } from '../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
  ],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly isLoading = this.authStore.isLoading;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  // Liste des rôles disponibles
  readonly availableRoles: { label: string; value: UserRole; icon: string }[] = [
    { label: 'Entreprise /Particulier', value: 'CLIENT', icon: 'pi-user' },
    { label: 'Fournisseur', value: 'SUPPLIER', icon: 'pi-building' },
    { label: 'Transporteur', value: 'TRANSPORTER', icon: 'pi-truck' },
  ];

  readonly form: FormGroup = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required]],
    roles: [[], [Validators.required, this.atLeastOneRoleValidator]],
  }, {
    validators: this.passwordMatchValidator
  });

  get firstName() { return this.form.get('first_name')!; }
  get lastName() { return this.form.get('last_name')!; }
  get email() { return this.form.get('email')!; }
  get phone() { return this.form.get('phone')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirm_password')!; }
  get roles() { return this.form.get('roles')!; }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  onRoleChange(role: UserRole, checked: boolean) {
    const currentRoles: UserRole[] = this.roles.value || [];
    let updatedRoles: UserRole[];

    if (checked) {
      updatedRoles = [...currentRoles, role];
    } else {
      updatedRoles = currentRoles.filter(r => r !== role);
    }

    this.roles.setValue(updatedRoles);
    this.roles.markAsTouched();
  }

  isRoleSelected(role: UserRole): boolean {
    return (this.roles.value || []).includes(role);
  }

  submit() {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirm_password, ...dto } = this.form.value;

    this.authStore.register(dto).subscribe({
      next: () => {
        // Redirection vers verify-otp après succès
        this.router.navigate(['/auth/verify-otp']);
      }
    });
  }

  /**
   * Validateur : au moins un rôle selectionné
   */
  private atLeastOneRoleValidator(control: AbstractControl): ValidationErrors | null {
    const roles = control.value as any[];
    return roles && roles.length > 0 ? null : { requiredRole: true };
  }

  /**
   * Validateur : correspondance des mots de passe
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirm_password');

    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
}
