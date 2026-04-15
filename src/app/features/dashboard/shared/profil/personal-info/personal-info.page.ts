import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  isEditing = signal(false);
  isSaving = signal(false);

  form!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const u = this.user();
    this.form = this.fb.group({
      first_name: [u?.first_name ?? '', [Validators.required, Validators.minLength(2)]],
      last_name: [u?.last_name ?? '', [Validators.required, Validators.minLength(2)]],
      phone: [u?.phone ?? ''],
    });
  }

  toggleEdit() {
    if (this.isEditing()) {
      // Annuler — restaurer les valeurs d'origine
      this.initForm();
      this.isEditing.set(false);
    } else {
      this.isEditing.set(true);
    }
  }

  async saveChanges() {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const dto: UpdateProfileDto = this.form.value;

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
