import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CatalogueApiService } from './catalogue.api.service';
import {
  Categorie,
  MateriauListItem,
  MateriauDetail,
  OffrePublique,
} from './catalogue.model';

@Injectable({ providedIn: 'root' })
export class CatalogueStore {

  // ── État interne (RxJS — interop uniquement) ──────────────────────
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  // ── Signals publics ───────────────────────────────────────────────
  readonly categories        = signal<Categorie[]>([]);
  readonly materiaux         = signal<MateriauListItem[]>([]);
  readonly selectedMateriau  = signal<MateriauDetail | null>(null);
  readonly offresPubliques   = signal<OffrePublique[]>([]);
  readonly selectedCategorie = signal<Categorie | null>(null);
  readonly searchQuery       = signal<string>('');
  readonly isLoading         = signal<boolean>(false);
  readonly isLoadingOffres   = signal<boolean>(false);
  readonly totalMateriaux    = signal<number>(0);

  // ── Computed ──────────────────────────────────────────────────────
  readonly filteredMateriaux = computed<MateriauListItem[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.materiaux();
    return this.materiaux().filter(
      (m) => m.nom.toLowerCase().includes(q),
    );
  });

  readonly hasCategories = computed(() => this.categories().length > 0);

  constructor(private api: CatalogueApiService) {}

  // ── Actions ───────────────────────────────────────────────────────

  async loadCategories(): Promise<void> {
    if (this.hasCategories()) return;
    this.isLoading.set(true);
    try {
      const cats = await firstValueFrom(this.api.getCategories());
      this.categories.set(cats);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMateriaux(categorieId?: number): Promise<void> {
    this.isLoading.set(true);
    this.materiaux.set([]);
    try {
      const res = await firstValueFrom(
        this.api.getMateriaux({ categorie_id: categorieId, limit: 50, active_only: true }),
      );
      this.materiaux.set(res.items);
      this.totalMateriaux.set(res.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMateriau(slug: string): Promise<void> {
    this.isLoading.set(true);
    this.selectedMateriau.set(null);
    this.offresPubliques.set([]);
    try {
      const mat = await firstValueFrom(this.api.getMateriau(slug));
      this.selectedMateriau.set(mat);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadOffresPubliques(matSlug: string): Promise<void> {
    this.isLoadingOffres.set(true);
    try {
      const offres = await firstValueFrom(this.api.getOffresPubliques(matSlug));
      this.offresPubliques.set(offres);
    } finally {
      this.isLoadingOffres.set(false);
    }
  }

  selectCategorie(categorie: Categorie | null): void {
    this.selectedCategorie.set(categorie);
    this.searchQuery.set('');
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  reset(): void {
    this.materiaux.set([]);
    this.selectedMateriau.set(null);
    this.offresPubliques.set([]);
    this.selectedCategorie.set(null);
    this.searchQuery.set('');
    this.totalMateriaux.set(0);
  }
}
