import { Component, OnInit, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular/standalone';
import { AdresseStore } from '../../../../../../../core/services/api/adresse/adresse.store';

export interface AdresseSelection {
  departement_id: number | null;
  commune_id: number | null;
  arrondissement_id: number | null;
  village_id: number | null;
  adresse_libre: string;
  full_address: string;
}

@Component({
  selector: 'app-adresse-selector',
  standalone: true,
  imports: [ReactiveFormsModule, IonSelect, IonSelectOption, IonSpinner],
  template: `
    <div class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <i class="pi pi-map-marker text-[16px]" style="color: var(--color-primary)"></i>
        <p class="text-[13px] font-bold text-gray-700">Adresse de livraison</p>
      </div>

      <form [formGroup]="form" class="px-4 py-3 flex flex-col gap-3">

        <!-- Département -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Département</label>
          <div class="relative rounded-xl border border-gray-200 bg-[var(--color-surface)] overflow-hidden"
               [class.border-[var(--color-primary)]]="form.get('departement_id')?.value">
            <ion-select
              formControlName="departement_id"
              placeholder="Choisir un département"
              interface="action-sheet"
              class="w-full text-[14px] px-3 py-2.5"
              (ionChange)="onDepartementChange($event)"
            >
              @for (d of adresseStore.departements(); track d.id) {
                <ion-select-option [value]="d.id">{{ d.name }}</ion-select-option>
              }
            </ion-select>
          </div>
        </div>

        <!-- Commune -->
        @if (adresseStore.communes().length > 0 || adresseStore.isLoading()) {
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Commune</label>
            <div class="relative rounded-xl border border-gray-200 bg-[var(--color-surface)] overflow-hidden">
              @if (adresseStore.isLoading()) {
                <div class="flex items-center gap-2 px-3 py-2.5">
                  <ion-spinner name="dots" class="w-4 h-4" style="color: var(--color-primary)" />
                  <span class="text-[13px] text-gray-400">Chargement…</span>
                </div>
              } @else {
                <ion-select
                  formControlName="commune_id"
                  placeholder="Choisir une commune"
                  interface="action-sheet"
                  class="w-full text-[14px] px-3 py-2.5"
                  (ionChange)="onCommuneChange($event)"
                >
                  @for (c of adresseStore.communes(); track c.id) {
                    <ion-select-option [value]="c.id">{{ c.name }}</ion-select-option>
                  }
                </ion-select>
              }
            </div>
          </div>
        }

        <!-- Arrondissement -->
        @if (adresseStore.arrondissements().length > 0) {
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Arrondissement</label>
            <div class="rounded-xl border border-gray-200 bg-[var(--color-surface)] overflow-hidden">
              <ion-select
                formControlName="arrondissement_id"
                placeholder="Choisir un arrondissement"
                interface="action-sheet"
                class="w-full text-[14px] px-3 py-2.5"
                (ionChange)="onArrondissementChange($event)"
              >
                @for (a of adresseStore.arrondissements(); track a.id) {
                  <ion-select-option [value]="a.id">{{ a.name }}</ion-select-option>
                }
              </ion-select>
            </div>
          </div>
        }

        <!-- Village -->
        @if (adresseStore.villages().length > 0) {
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Village / Quartier</label>
            <div class="rounded-xl border border-gray-200 bg-[var(--color-surface)] overflow-hidden">
              <ion-select
                formControlName="village_id"
                placeholder="Choisir un village"
                interface="action-sheet"
                class="w-full text-[14px] px-3 py-2.5"
                (ionChange)="emitChange()"
              >
                @for (v of adresseStore.villages(); track v.id) {
                  <ion-select-option [value]="v.id">{{ v.name }}</ion-select-option>
                }
              </ion-select>
            </div>
          </div>
        }

        <!-- Adresse libre -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Précision d'adresse
          </label>
          <input
            formControlName="adresse_libre"
            type="text"
            placeholder="Ex: Carrefour SOBEMAP, rue de la Croix-Rouge…"
            class="w-full rounded-xl border border-gray-200 bg-[var(--color-surface)]
                   px-3 py-2.5 text-[14px] text-gray-800 placeholder-gray-400
                   focus:outline-none focus:border-[var(--color-primary)]"
            (input)="emitChange()"
          />
        </div>

      </form>
    </div>
  `,
})
export class AdresseSelectorComponent implements OnInit {
  readonly adresseStore = inject(AdresseStore);
  private readonly fb   = inject(FormBuilder);

  readonly adresseChange = output<AdresseSelection>();

  form: FormGroup = this.fb.group({
    departement_id:    [null, Validators.required],
    commune_id:        [null],
    arrondissement_id: [null],
    village_id:        [null],
    adresse_libre:     ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.adresseStore.loadPays();
    const pays = this.adresseStore.pays();
    if (pays.length > 0) {
      await this.adresseStore.loadDepartements(pays[0].id);
    }
  }

  async onDepartementChange(event: CustomEvent): Promise<void> {
    const id = event.detail.value as number;
    this.form.patchValue({ commune_id: null, arrondissement_id: null, village_id: null });
    await this.adresseStore.loadCommunes(id);
    this.emitChange();
  }

  async onCommuneChange(event: CustomEvent): Promise<void> {
    const id = event.detail.value as number;
    this.form.patchValue({ arrondissement_id: null, village_id: null });
    await this.adresseStore.loadArrondissements(id);
    this.emitChange();
  }

  async onArrondissementChange(event: CustomEvent): Promise<void> {
    const id = event.detail.value as number;
    this.form.patchValue({ village_id: null });
    await this.adresseStore.loadVillages(id);
    this.emitChange();
  }

  emitChange(): void {
    const v = this.form.value;
    const parts: string[] = [];

    const dept = this.adresseStore.departements().find((d) => d.id === v.departement_id);
    const commune = this.adresseStore.communes().find((c) => c.id === v.commune_id);
    const arr = this.adresseStore.arrondissements().find((a) => a.id === v.arrondissement_id);
    const village = this.adresseStore.villages().find((vi) => vi.id === v.village_id);

    if (v.adresse_libre) parts.push(v.adresse_libre);
    if (village)   parts.push(village.name);
    if (arr)       parts.push(arr.name);
    if (commune)   parts.push(commune.name);
    if (dept)      parts.push(dept.name);

    this.adresseChange.emit({
      departement_id:    v.departement_id,
      commune_id:        v.commune_id,
      arrondissement_id: v.arrondissement_id,
      village_id:        v.village_id,
      adresse_libre:     v.adresse_libre ?? '',
      full_address:      parts.join(', '),
    });
  }
}
