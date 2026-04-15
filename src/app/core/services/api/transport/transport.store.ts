import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TransportApiService } from './transport.api.service';
import {
  CamionType,
  Tarif, TarifCreate, TarifUpdate,
  Course, CourseStatut,
} from './transport.model';

@Injectable({ providedIn: 'root' })
export class TransportStore {

  // ── État ──────────────────────────────────────────────────────────
  readonly camions      = signal<CamionType[]>([]);
  readonly mesTarifs    = signal<Tarif[]>([]);
  readonly mesCourses   = signal<Course[]>([]);
  readonly isLoading    = signal(false);
  readonly isSubmitting = signal(false);

  // ── Computed ──────────────────────────────────────────────────────
  readonly hasCamions = computed(() => this.camions().length > 0);

  readonly camionsSorted = computed(() =>
    [...this.camions()].sort((a, b) => a.ordre - b.ordre),
  );

  readonly coursesEnAttente = computed(() =>
    this.mesCourses().filter((c) => c.statut === 'EN_ATTENTE'),
  );
  readonly coursesActives = computed(() =>
    this.mesCourses().filter((c) => c.statut === 'ASSIGNEE' || c.statut === 'EN_COURS'),
  );
  readonly coursesTerminees = computed(() =>
    this.mesCourses().filter((c) => c.statut === 'LIVREE'),
  );

  constructor(private api: TransportApiService) {}

  // ── Camions ────────────────────────────────────────────────────────

  async loadCamions(): Promise<void> {
    if (this.hasCamions()) return;
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getCamions());
      this.camions.set(list.filter((c) => c.est_actif));
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Tarifs ─────────────────────────────────────────────────────────

  async loadMesTarifs(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesTarifs());
      this.mesTarifs.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createTarif(dto: TarifCreate): Promise<Tarif> {
    this.isSubmitting.set(true);
    try {
      const tarif = await firstValueFrom(this.api.createTarif(dto));
      this.mesTarifs.update((list) => [tarif, ...list]);
      return tarif;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async updateTarif(id: number, dto: TarifUpdate): Promise<void> {
    this.isSubmitting.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateTarif(id, dto));
      this.mesTarifs.update((list) => list.map((t) => (t.id === id ? updated : t)));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteTarif(id: number): Promise<void> {
    await firstValueFrom(this.api.deleteTarif(id));
    this.mesTarifs.update((list) => list.filter((t) => t.id !== id));
  }

  // ── Courses ────────────────────────────────────────────────────────

  async loadMesCourses(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesCourses());
      this.mesCourses.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateCourseStatut(id: number, statut: CourseStatut): Promise<void> {
    const updated = await firstValueFrom(this.api.updateCourseStatut(id, statut));
    this.mesCourses.update((list) => list.map((c) => (c.id === id ? updated : c)));
  }
}
