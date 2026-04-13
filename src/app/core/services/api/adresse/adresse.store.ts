import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdresseApiService } from './adresse.api.service';
import { Pays, Departement, Commune, Arrondissement, Village, DepartementFlat } from './adresse.model';

@Injectable({ providedIn: 'root' })
export class AdresseStore {

  readonly pays          = signal<Pays[]>([]);
  readonly departements  = signal<DepartementFlat[]>([]);
  readonly communes      = signal<Commune[]>([]);
  readonly arrondissements = signal<Arrondissement[]>([]);
  readonly villages      = signal<Village[]>([]);
  readonly isLoading     = signal(false);

  readonly hasPays = computed(() => this.pays().length > 0);

  constructor(private api: AdresseApiService) {}

  async loadPays(): Promise<void> {
    if (this.hasPays()) return;
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getPays());
      this.pays.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadDepartements(paysId: number): Promise<void> {
    this.departements.set([]);
    this.communes.set([]);
    this.arrondissements.set([]);
    this.villages.set([]);
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getDepartements(paysId));
      this.departements.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCommunes(departementId: number): Promise<void> {
    this.communes.set([]);
    this.arrondissements.set([]);
    this.villages.set([]);
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getCommunes(departementId));
      this.communes.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadArrondissements(communeId: number): Promise<void> {
    this.arrondissements.set([]);
    this.villages.set([]);
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getArrondissements(communeId));
      this.arrondissements.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadVillages(arrondissementId: number): Promise<void> {
    this.villages.set([]);
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getVillages(arrondissementId));
      this.villages.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }
}
