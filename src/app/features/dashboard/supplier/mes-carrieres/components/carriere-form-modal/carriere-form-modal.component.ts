import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonInput, IonItem, IonSpinner,
} from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { Carriere, CarriereCreate, CarriereUpdate } from 'src/app/core/services/api/materiaux/materiaux.model';

@Component({
  selector: 'app-carriere-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonInput, IonItem, IonSpinner,
  ],
  templateUrl: './carriere-form-modal.component.html',
})
export class CarriereFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() editTarget: Carriere | null = null; // null = création

  @Output() onSubmit  = new EventEmitter<CarriereCreate | CarriereUpdate>();
  @Output() onDismiss = new EventEmitter<void>();

  locating = false;

  form: FormGroup = new FormBuilder().group({
    nom:          ['', [Validators.required, Validators.minLength(3)]],
    adresse_texte:['', [Validators.required, Validators.minLength(5)]],
    latitude:     [null as number | null, Validators.required],
    longitude:    [null as number | null, Validators.required],
  });

  get isEdit(): boolean { return !!this.editTarget; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editTarget'] || changes['isOpen']) {
      if (this.editTarget) {
        this.form.patchValue({
          nom:           this.editTarget.nom,
          adresse_texte: this.editTarget.adresse_texte,
          latitude:      this.editTarget.latitude,
          longitude:     this.editTarget.longitude,
        });
      } else {
        this.form.reset();
      }
    }
  }

  async detectLocation() {
    this.locating = true;
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.form.patchValue({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch { /* permission refusée */ }
    finally { this.locating = false; }
  }

  dismiss() {
    this.form.reset();
    this.onDismiss.emit();
  }

  submit() {
    if (this.form.invalid) return;
    const { nom, adresse_texte, latitude, longitude } = this.form.value;
    if (this.isEdit) {
      this.onSubmit.emit({ nom, adresse_texte, latitude, longitude } as CarriereUpdate);
    } else {
      this.onSubmit.emit({ nom, adresse_texte, latitude, longitude } as CarriereCreate);
    }
  }

  fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}
