import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonInput, IonItem, IonSelect,
  IonSelectOption, IonToggle, IonSpinner,
} from '@ionic/angular/standalone';
import {
  Carriere, CamionType,
  OffreFournisseur, OffreFournisseurCreate, OffreFournisseurUpdate,
} from 'src/app/core/services/api/materiaux/materiaux.model';

@Component({
  selector: 'app-offre-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonInput, IonItem, IonSelect,
    IonSelectOption, IonToggle, IonSpinner,
  ],
  templateUrl: './offre-form-modal.component.html',
})
export class OffreFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() editTarget: OffreFournisseur | null = null;
  @Input({ required: true }) carrieres: Carriere[] = [];
  @Input({ required: true }) materiaux: any[] = [];
  @Input({ required: true }) camionTypes: CamionType[] = [];

  @Output() onSubmit  = new EventEmitter<OffreFournisseurCreate | OffreFournisseurUpdate>();
  @Output() onDismiss = new EventEmitter<void>();

  get isEdit(): boolean { return !!this.editTarget; }

  form: FormGroup = new FormBuilder().group({
    materiau_id:           [null, Validators.required],
    carriere_id:           [null, Validators.required],
    prix_unitaire:         [null, [Validators.required, Validators.min(1)]],
    camion_type_id:        [null],
    transport_propre:      [false],
    prix_transport_sep:    [null],
    quantite_min_commande: [null, Validators.min(0)],
    delai_livraison_jours: [null, [Validators.min(0), Validators.max(365)]],
  });

  get transportPropre(): boolean {
    return !!this.form.get('transport_propre')?.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editTarget'] || changes['isOpen']) {
      const t = this.editTarget;
      if (t) {
        this.form.patchValue({
          materiau_id:           t.materiau_id,
          carriere_id:           t.carriere_id,
          prix_unitaire:         t.prix_unitaire,
          camion_type_id:        t.camion_type_id,
          transport_propre:      t.transport_propre,
          prix_transport_sep:    t.prix_transport_sep,
          quantite_min_commande: t.quantite_min_commande,
          delai_livraison_jours: t.delai_livraison_jours,
        });
        // En mode édition, matériau et carrière sont figés
        this.form.get('materiau_id')?.disable();
        this.form.get('carriere_id')?.disable();
      } else {
        this.form.reset({ transport_propre: false });
        this.form.get('materiau_id')?.enable();
        this.form.get('carriere_id')?.enable();
      }
    }
  }

  dismiss() {
    this.form.reset({ transport_propre: false });
    this.onDismiss.emit();
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    if (this.isEdit) {
      const dto: OffreFournisseurUpdate = {
        prix_unitaire:         +v.prix_unitaire,
        transport_propre:      v.transport_propre,
        prix_transport_sep:    v.transport_propre ? (v.prix_transport_sep ? +v.prix_transport_sep : undefined) : undefined,
        quantite_min_commande: v.quantite_min_commande ? +v.quantite_min_commande : undefined,
        delai_livraison_jours: v.delai_livraison_jours ? +v.delai_livraison_jours : undefined,
      };
      this.onSubmit.emit(dto);
    } else {
      const dto: OffreFournisseurCreate = {
        materiau_id:           +v.materiau_id,
        carriere_id:           +v.carriere_id,
        prix_unitaire:         +v.prix_unitaire,
        camion_type_id:        v.camion_type_id ? +v.camion_type_id : undefined,
        transport_propre:      v.transport_propre,
        prix_transport_sep:    v.transport_propre ? (v.prix_transport_sep ? +v.prix_transport_sep : undefined) : undefined,
        quantite_min_commande: v.quantite_min_commande ? +v.quantite_min_commande : undefined,
        delai_livraison_jours: v.delai_livraison_jours ? +v.delai_livraison_jours : undefined,
      };
      this.onSubmit.emit(dto);
    }
  }

  fieldError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c.touched);
  }
}
