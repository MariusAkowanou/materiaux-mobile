import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonButton, IonButtons, IonSpinner,
} from '@ionic/angular/standalone';
import { CamionType, TarifCreate, ModeTarif } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-tarif-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonSelect, IonSelectOption,
    IonInput, IonButton, IonButtons, IonSpinner,
  ],
  templateUrl: './tarif-form-modal.component.html',
})
export class TarifFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() camions: CamionType[] = [];
  @Output() onSubmit  = new EventEmitter<TarifCreate>();
  @Output() onDismiss = new EventEmitter<void>();

  readonly modes: { value: ModeTarif; label: string; icon: string }[] = [
    { value: 'km',     label: 'Par kilomètre', icon: 'pi-map'   },
    { value: 'voyage', label: 'Par voyage',     icon: 'pi-truck' },
  ];

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      camion_type_id: [null, Validators.required],
      mode_tarif:     ['km', Validators.required],
      prix:           [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.form.reset({ mode_tarif: 'km' });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.onSubmit.emit(this.form.value as TarifCreate);
  }
}
