import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MateriauxApiService } from './materiaux.api.service';
import {
  Carriere, CarriereCreate, CarriereUpdate,
  CamionType,
  OffreFournisseur, OffreFournisseurCreate, OffreFournisseurUpdate,
  OffreStatut,
} from './materiaux.model';

@Injectable({ providedIn: 'root' })
export class MateriauxStore {

  // ── État ──────────────────────────────────────────────────────────
  readonly mesCarrieres  = signal<Carriere[]>([]);
  readonly mesOffres     = signal<OffreFournisseur[]>([]);
  readonly camionTypes   = signal<CamionType[]>([]);
  readonly isLoading     = signal(false);
  readonly isSubmitting  = signal(false);

  // ── Computed ──────────────────────────────────────────────────────
  readonly activeOffres = computed(() =>
    this.mesOffres().filter((o) => o.statut === 'ACTIVE'),
  );
  readonly activeCarrieres = computed(() =>
    this.mesCarrieres().filter((c) => c.is_active),
  );

  constructor(private api: MateriauxApiService) {}

  // ── Carrières ──────────────────────────────────────────────────────

  async loadMesCarrieres(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesCarrieres());
      this.mesCarrieres.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createCarriere(dto: CarriereCreate): Promise<Carriere> {
    this.isSubmitting.set(true);
    try {
      const c = await firstValueFrom(this.api.createCarriere(dto));
      this.mesCarrieres.update((list) => [c, ...list]);
      return c;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateCarriere(id: number, dto: CarriereUpdate): Promise<void> {
    this.isSubmitting.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateCarriere(id, dto));
      this.mesCarrieres.update((list) =>
        list.map((c) => (c.id === id ? updated : c)),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteCarriere(id: number): Promise<void> {
    await firstValueFrom(this.api.deleteCarriere(id));
    this.mesCarrieres.update((list) => list.filter((c) => c.id !== id));
  }

  // ── Offres ─────────────────────────────────────────────────────────

  async loadMesOffres(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesOffres());
      this.mesOffres.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createOffre(dto: OffreFournisseurCreate): Promise<OffreFournisseur> {
    this.isSubmitting.set(true);
    try {
      const o = await firstValueFrom(this.api.createOffre(dto));
      this.mesOffres.update((list) => [o, ...list]);
      return o;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateOffre(id: number, dto: OffreFournisseurUpdate): Promise<void> {
    this.isSubmitting.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateOffre(id, dto));
      this.mesOffres.update((list) =>
        list.map((o) => (o.id === id ? updated : o)),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateOffreStatut(id: number, statut: OffreStatut): Promise<void> {
    const updated = await firstValueFrom(this.api.updateOffreStatut(id, statut));
    this.mesOffres.update((list) =>
      list.map((o) => (o.id === id ? updated : o)),
    );
  }

  async deleteOffre(id: number): Promise<void> {
    await firstValueFrom(this.api.deleteOffre(id));
    this.mesOffres.update((list) => list.filter((o) => o.id !== id));
  }

  // ── Camion types ───────────────────────────────────────────────────

  async loadCamionTypes(): Promise<void> {
    if (this.camionTypes().length > 0) return; // cache
    try {
      const list = await firstValueFrom(this.api.getCamionTypes());
      this.camionTypes.set(list);
    } catch { /* non bloquant */ }
  }
}
