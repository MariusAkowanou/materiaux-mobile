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
  readonly carrieres     = signal<Carriere[]>([]);
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

   async loadCarrieres(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getCarrieres());
      this.carrieres.set(list);
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
      this.mesOffres.set(list.map((o) => this.normalizeOffre(o)));
    } finally {
      this.isLoading.set(false);
    }
  }

  async createOffre(dto: OffreFournisseurCreate): Promise<OffreFournisseur> {
    this.isSubmitting.set(true);
    try {
      const o = this.normalizeOffre(await firstValueFrom(this.api.createOffre(dto)));
      this.mesOffres.update((list) => [o, ...list]);
      return o;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateOffre(id: number, dto: OffreFournisseurUpdate): Promise<void> {
    this.isSubmitting.set(true);
    try {
      const updated = this.normalizeOffre(await firstValueFrom(this.api.updateOffre(id, dto)));
      this.mesOffres.update((list) =>
        list.map((o) => (o.id === id ? updated : o)),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateOffreStatut(id: number, statut: OffreStatut): Promise<void> {
    const updated = this.normalizeOffre(await firstValueFrom(this.api.updateOffreStatut(id, statut)));
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

  private normalizeOffre(raw: any): OffreFournisseur {
    return {
      id: Number(raw?.id ?? 0),
      public_id: String(raw?.public_id ?? ''),
      materiau_id: Number(raw?.materiau_id ?? 0),
      materiau_nom: String(raw?.materiau_nom ?? ''),
      materiau_unite: String(raw?.materiau_unite ?? ''),
      carriere_id: Number(raw?.carriere_id ?? 0),
      carriere_nom: String(raw?.carriere_nom ?? ''),
      prix_unitaire: this.toNumber(raw?.prix_unitaire),
      camion_type_id: raw?.camion_type_id ?? null,
      camion_libelle: raw?.camion_libelle ?? raw?.camion_type ?? null,
      transport_propre: Boolean(raw?.transport_propre),
      prix_transport_sep: this.toNullableNumber(raw?.prix_transport_sep),
      quantite_min_commande: this.toNullableNumber(raw?.quantite_min_commande),
      delai_livraison_jours: this.toNullableNumber(raw?.delai_livraison_jours),
      statut: this.normalizeStatut(raw?.statut),
      created_at: String(raw?.created_at ?? ''),
    };
  }

  private normalizeStatut(value: unknown): OffreStatut {
    const s = String(value ?? '').toUpperCase();
    if (s === 'EN_RUPTURE' || s === 'ARCHIVEE') return s;
    return 'ACTIVE';
  }

  private toNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private toNullableNumber(value: unknown): number | null {
    if (value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}
