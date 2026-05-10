import { Component, computed, effect, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../../../../../core/services/api/auth/auth.store';
import { ToastService } from '../../../../../core/services/local/toast.service';
import { UpdateProfileDto } from '../../../../../core/services/api/auth/auth.model';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
    ReactiveFormsModule,
    DatePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './personal-info.page.html',
})
export class PersonalInfoPage implements OnInit {
  private authStore = inject(AuthStore);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly user = this.authStore.currentUser;
  readonly isLoading = this.authStore.isLoading;

  readonly isEditing = signal(false);
  readonly isSaving = signal(false);

  form!: FormGroup;

  readonly hasCompanySection = computed(() => {
    const u = this.user();
    if (!u) return false;
    return !!u.company_name || !!u.ifu || ['COMPANY', 'SUPPLIER', 'TRANSPORTER'].includes(u.primary_role);
  });

  readonly hasDocumentsSection = computed(() => {
    const u = this.user();
    return !!u?.documents_info;
  });

  constructor() {
    effect(() => {
      const u = this.user();
      if (!u || !this.form) return;

      this.form.patchValue({
        first_name: u.first_name ?? '',
        last_name: u.last_name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        company_name: u.company_name ?? '',
        ifu: u.ifu ?? '',
        document_type: u.documents_info?.type ?? '',
        license_url: u.documents_info?.license_url ?? '',
        insurance_url: u.documents_info?.insurance_url ?? '',
      }, { emitEvent: false });
    });
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.minLength(8)]],

      company_name: [''],
      ifu: [''],

      document_type: [{ value: '', disabled: true }],
      license_url: [''],
      insurance_url: [''],
    });
  }

  toggleEdit() {
    if (this.isEditing()) {
      const u = this.user();
      if (u) {
        this.form.patchValue({
          first_name: u.first_name ?? '',
          last_name: u.last_name ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          company_name: u.company_name ?? '',
          ifu: u.ifu ?? '',
          document_type: u.documents_info?.type ?? '',
          license_url: u.documents_info?.license_url ?? '',
          insurance_url: u.documents_info?.insurance_url ?? '',
        }, { emitEvent: false });
      }
      this.isEditing.set(false);
      return;
    }

    this.isEditing.set(true);
  }

  async saveChanges() {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);

    const raw = this.form.getRawValue();

    const dto: UpdateProfileDto = {
      first_name: raw.first_name,
      last_name: raw.last_name,
      phone: raw.phone,
      company_name: raw.company_name || null,
      ifu: raw.ifu || null,
    };

    this.authStore.updateProfile(dto).subscribe({
      next: async () => {
        await this.toast.success('Profil mis à jour avec succès !');
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: async (err) => {
        console.error('[PersonalInfoPage] Update failed:', err);
        await this.toast.error('Erreur lors de la mise à jour. Veuillez réessayer.');
        this.isSaving.set(false);
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      CLIENT: 'bg-sky-100 text-sky-700',
      COMPANY: 'bg-orange-100 text-orange-700',
      SUPPLIER: 'bg-green-100 text-green-700',
      TRANSPORTER: 'bg-purple-100 text-purple-700',
      ADMIN: 'bg-red-100 text-red-700',
    };
    return map[role] ?? 'bg-gray-100 text-gray-700';
  }
}