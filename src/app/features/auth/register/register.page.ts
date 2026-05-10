import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent } from '@ionic/angular/standalone';
import { AuthStore } from '../../../core/services/api/auth/auth.store';
import { UserRole } from '../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
  ],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = this.authStore.isLoading;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly availableRoles: { label: string; value: UserRole; icon: string }[] = [
    { label: 'Entreprise', value: 'COMPANY', icon: 'pi-building' },
    { label: 'Particulier', value: 'CLIENT', icon: 'pi-user' },
    { label: 'Fournisseur', value: 'SUPPLIER', icon: 'pi-box' },
    { label: 'Transporteur', value: 'TRANSPORTER', icon: 'pi-truck' },
  ];

  readonly form: FormGroup = this.fb.group(
    {
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
      roles: [[], [Validators.required, this.atLeastOneRoleValidator]],

      ifu: [''],
      company_name: [''],
      depot_address: [''],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  constructor() {
    this.listenRoleChanges();
    this.updateConditionalValidators(this.roles.value || []);
  }

  get firstName() {
    return this.form.get('first_name')!;
  }

  get lastName() {
    return this.form.get('last_name')!;
  }

  get email() {
    return this.form.get('email')!;
  }

  get phone() {
    return this.form.get('phone')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  get confirmPassword() {
    return this.form.get('confirm_password')!;
  }

  get roles() {
    return this.form.get('roles')!;
  }

  get ifu() {
    return this.form.get('ifu')!;
  }

  get companyName() {
    return this.form.get('company_name')!;
  }

  get depotAddress() {
    return this.form.get('depot_address')!;
  }

  get hasCompanyRole(): boolean {
    return this.isRoleSelected('COMPANY');
  }

  get hasTransporterRole(): boolean {
    return this.isRoleSelected('TRANSPORTER');
  }

  get hasSupplierRole(): boolean {
    return this.isRoleSelected('SUPPLIER');
  }

  get shouldShowCompanyFields(): boolean {
    return this.hasCompanyRole || this.hasTransporterRole || this.hasSupplierRole;
  }

  get shouldShowDepotAddressField(): boolean {
    return this.hasSupplierRole;
  }

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
      updatedRoles = currentRoles.includes(role)
        ? currentRoles
        : [...currentRoles, role];
    } else {
      updatedRoles = currentRoles.filter(r => r !== role);
    }

    this.roles.setValue(updatedRoles);
    this.roles.markAsTouched();
    this.roles.updateValueAndValidity();
  }

  isRoleSelected(role: UserRole): boolean {
    return (this.roles.value || []).includes(role);
  }

  submit() {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      confirm_password,
      ...dto
    } = this.form.getRawValue();

    this.authStore.register(dto).subscribe({
      next: () => {
        this.router.navigate(
          ['/auth/verify-otp'],
          { queryParams: { email: dto.email } }
        );
      }
    });
  }

  private listenRoleChanges() {
    this.roles.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roles: UserRole[]) => {
        this.updateConditionalValidators(roles || []);
      });
  }

  private updateConditionalValidators(selectedRoles: UserRole[]) {
    const requireCompanyFields =
      selectedRoles.includes('COMPANY') ||
      selectedRoles.includes('TRANSPORTER') ||
      selectedRoles.includes('SUPPLIER');

    const requireDepotAddress =
      selectedRoles.includes('SUPPLIER');

    if (requireCompanyFields) {
      this.ifu.setValidators([Validators.required, Validators.minLength(6)]);
      this.companyName.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      this.ifu.clearValidators();
      this.companyName.clearValidators();
      this.ifu.setValue('');
      this.companyName.setValue('');
    }

    if (requireDepotAddress) {
      this.depotAddress.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      this.depotAddress.clearValidators();
      this.depotAddress.setValue('');
    }

    this.ifu.updateValueAndValidity({ emitEvent: false });
    this.companyName.updateValueAndValidity({ emitEvent: false });
    this.depotAddress.updateValueAndValidity({ emitEvent: false });
  }

  private atLeastOneRoleValidator(control: AbstractControl): ValidationErrors | null {
    const roles = control.value as UserRole[];
    return roles && roles.length > 0 ? null : { requiredRole: true };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirm_password');

    if (!password || !confirm) {
      return null;
    }

    if (password.value !== confirm.value) {
      const errors = confirm.errors || {};
      confirm.setErrors({ ...errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirm.hasError('passwordMismatch')) {
      const { passwordMismatch, ...otherErrors } = confirm.errors || {};
      confirm.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;
  }
}