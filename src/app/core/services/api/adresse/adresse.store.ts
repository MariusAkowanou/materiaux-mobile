import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdresseApiService } from './adresse.api.service';
import {
  Pays, Commune, Arrondissement, Village, DepartementFlat,
  ClientAddress, ClientAddressCreate,
} from './adresse.model';

@Injectable({ providedIn: 'root' })
export class AdresseStore {

  // ── Référentiel géographique ───────────────────────────────────────────────
  readonly pays            = signal<Pays[]>([]);
  readonly departements    = signal<DepartementFlat[]>([]);
  readonly communes        = signal<Commune[]>([]);
  readonly arrondissements = signal<Arrondissement[]>([]);
  readonly villages        = signal<Village[]>([]);
  readonly isLoading       = signal(false);

  // ── Carnet d'adresses client ───────────────────────────────────────────────
  readonly mesAdresses     = signal<ClientAddress[]>([]);
  readonly isLoadingCarnet = signal(false);
  readonly isAddingAdresse = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly hasPays     = computed(() => this.pays().length > 0);
  readonly hasAdresses = computed(() => this.mesAdresses().length > 0);

  constructor(private api: AdresseApiService) {}

  // ── Référentiel ───────────────────────────────────────────────────────────

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

  // ── Carnet d'adresses ─────────────────────────────────────────────────────

  async loadMesAdresses(): Promise<void> {
    this.isLoadingCarnet.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesAdresses());
      this.mesAdresses.set(list);
    } finally {
      this.isLoadingCarnet.set(false);
    }
  }

  async addAdresse(dto: ClientAddressCreate): Promise<ClientAddress> {
    this.isAddingAdresse.set(true);
    try {
      const addr = await firstValueFrom(this.api.addAdresse(dto));
      this.mesAdresses.update(list => [addr, ...list]);
      return addr;
    } finally {
      this.isAddingAdresse.set(false);
    }
  }

  async deleteAdresse(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteAdresse(id));
    this.mesAdresses.update(list => list.filter(a => a.id !== id));
  }
}
