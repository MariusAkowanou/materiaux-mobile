import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TransportApiService } from './transport.api.service';
import {
  CamionType,
  Tarif, TarifCreate, TarifUpdate,
  Course, CourseStatut,
  ReseauMembership,
  CarriereDisponible,
  OffreDisponible,
  MissionTransporteur,
  ProfilTransporteur, ProfilTransporteurDto,
} from './transport.model';

export interface AcceptResult {
  success: boolean;
  taken: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class TransportStore {

  // ── État ──────────────────────────────────────────────────────────
  readonly camions             = signal<CamionType[]>([]);
  readonly mesTarifs           = signal<Tarif[]>([]);
  readonly mesCourses          = signal<Course[]>([]);
  readonly currentCourse       = signal<Course | null>(null);
  readonly mesReseaux          = signal<ReseauMembership[]>([]);
  readonly carrieresDisponibles= signal<CarriereDisponible[]>([]);
  readonly offresDisponibles   = signal<OffreDisponible[]>([]);
  readonly mesMissions         = signal<MissionTransporteur[]>([]);
  readonly monProfil           = signal<ProfilTransporteur | null>(null);
  readonly isLoading           = signal(false);
  readonly isSubmitting        = signal(false);
  readonly isLoadingCarrieres  = signal(false);

  // ── Computed ──────────────────────────────────────────────────────
  readonly hasCamions = computed(() => this.camions().length > 0);

  readonly camionsSorted = computed(() =>
    [...this.camions()].sort((a, b) => a.ordre - b.ordre),
  );

  readonly coursesActives = computed(() =>
    this.mesCourses().filter((c) => c.statut === 'ASSIGNEE' || c.statut === 'EN_COURS'),
  );
  readonly coursesTerminees = computed(() =>
    this.mesCourses().filter((c) => c.statut === 'LIVREE'),
  );
  readonly coursesActivesCount   = computed(() => this.coursesActives().length);
  readonly coursesTermineesCount = computed(() => this.coursesTerminees().length);

  /** Offres en_attente uniquement */
  readonly offresEnAttente = computed(() =>
    this.offresDisponibles().filter((o) => o.statut === 'en_attente'),
  );

  /** Missions actives (ASSIGNED ou IN_PROGRESS) */
  readonly missionsActives = computed(() =>
    this.mesMissions().filter(
      (m) => m.status === 'ASSIGNED' || m.status === 'IN_PROGRESS',
    ),
  );

  readonly estDisponible = computed(() => this.monProfil()?.est_disponible ?? true);

  /** IDs des carrières déjà rejointes — pour la modal */
  readonly reseauxIds = computed(() =>
    new Set(this.mesReseaux().map((r) => r.carriere_id)),
  );

  constructor(private api: TransportApiService) {}

  // ── Profil ────────────────────────────────────────────────────────

  async loadMonProfil(): Promise<void> {
    try {
      const profil = await firstValueFrom(this.api.getMonProfil());
      this.monProfil.set(profil);
    } catch {
      this.monProfil.set(null);
    }
  }

  async updateDisponibilite(estDisponible: boolean): Promise<void> {
    const profil = await firstValueFrom(this.api.updateProfil({ est_disponible: estDisponible }));
    this.monProfil.set(profil);
  }

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

  // ── Carrières disponibles (pour rejoindre) ─────────────────────────

  async loadCarrieresDisponibles(): Promise<void> {
    this.isLoadingCarrieres.set(true);
    try {
      const list = await firstValueFrom(this.api.getCarrieresDisponibles());
      this.carrieresDisponibles.set(list.filter((c) => c.est_active));
    } catch {
      this.carrieresDisponibles.set([]);
    } finally {
      this.isLoadingCarrieres.set(false);
    }
  }

  // ── Réseau de carrières ────────────────────────────────────────────

  async loadMesReseaux(): Promise<void> {
    this.isLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.getMesReseaux());
      this.mesReseaux.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  async rejoindrMultiple(carriereIds: number[]): Promise<void> {
    const memberships = await firstValueFrom(
      this.api.rejoindrMultiple({ carriere_ids: carriereIds }),
    );
    this.mesReseaux.update((list) => {
      const updated = [...list];
      for (const m of memberships) {
        const idx = updated.findIndex((r) => r.carriere_id === m.carriere_id);
        if (idx >= 0) updated[idx] = m;
        else updated.push(m);
      }
      return updated;
    });
  }

  async quitterReseau(carriereId: number): Promise<void> {
    await firstValueFrom(this.api.quitterReseau(carriereId));
    this.mesReseaux.update((list) => list.filter((r) => r.carriere_id !== carriereId));
  }

  // ── Offres disponibles ─────────────────────────────────────────────

  async loadOffresDisponibles(): Promise<void> {
    try {
      const offres = await firstValueFrom(this.api.getOffresDisponibles());
      this.offresDisponibles.set(offres.filter((o) => o.statut === 'en_attente'));
    } catch {
      this.offresDisponibles.set([]);
    }
  }

  addOffreFromWs(payload: any): void {
    const offre: OffreDisponible = {
      offre_id:    payload.offre_id ?? 0,
      order_id:    payload.order_id,
      statut:      'en_attente',
      accepted_at: null,
      created_at:  new Date().toISOString(),
      order: {
        order_id:     payload.order_id,
        order_number: payload.order_number,
        status:       'CONFIRMED',
        quote: {
          delivery_address: payload.delivery_address ?? '',
          origin_address:   payload.origin_address   ?? '',
          distance_km:      payload.distance_km       ?? 0,
          transport_cost:   payload.prix_transport    ?? 0,
          quantity:         payload.quantity           ?? 0,
        },
      },
    };
    this.offresDisponibles.update((list) => {
      if (list.find((o) => o.order_id === offre.order_id)) return list;
      return [offre, ...list];
    });
  }

  markOrderTaken(orderId: string): void {
    this.offresDisponibles.update((list) =>
      list.map((o) => o.order_id === orderId ? { ...o, _takenByOther: true } : o),
    );
    setTimeout(() => {
      this.offresDisponibles.update((list) =>
        list.filter((o) => o.order_id !== orderId),
      );
    }, 3000);
  }

  // ── Missions ───────────────────────────────────────────────────────

  async loadMesMissions(): Promise<void> {
    try {
      const list = await firstValueFrom(this.api.getMesMissions());
      this.mesMissions.set(list);
    } catch {
      this.mesMissions.set([]);
    }
  }

  // ── Accepter une offre ─────────────────────────────────────────────

  async accepterCourse(orderId: string): Promise<AcceptResult> {
    this.isSubmitting.set(true);
    try {
      const res = await firstValueFrom(this.api.accepterCourse(orderId));
      this.offresDisponibles.update((list) =>
        list.filter((o) => o.order_id !== orderId),
      );
      await this.loadMesMissions();
      return { success: true, taken: false, message: res.message };
    } catch (err: any) {
      const taken = err?.status === 409;
      if (taken) this.markOrderTaken(orderId);
      return {
        success: false,
        taken,
        message: taken
          ? 'Course déjà prise par un autre transporteur'
          : 'Erreur lors de l\'acceptation',
      };
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // ── Démarrer la livraison ──────────────────────────────────────────

  async demarrerLivraison(orderId: string): Promise<void> {
    await firstValueFrom(this.api.demarrerLivraison(orderId));
    this.mesMissions.update((list) =>
      list.map((m) => (m.public_id === orderId ? { ...m, status: 'IN_PROGRESS' as const } : m)),
    );
  }

  async confirmerLivraison(orderId: string): Promise<void> {
    await firstValueFrom(this.api.confirmerLivraison(orderId));
    this.mesMissions.update((list) =>
      list.map((m) =>
        m.public_id === orderId
          ? { ...m, status: 'COMPLETED' as const, completion_pct: 100 }
          : m,
      ),
    );
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

  async loadCourse(id: number): Promise<void> {
    this.isLoading.set(true);
    this.currentCourse.set(null);
    try {
      const course = await firstValueFrom(this.api.getCourse(id));
      this.currentCourse.set(course);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCourseByPublicId(publicId: string): Promise<void> {
    this.isLoading.set(true);
    this.currentCourse.set(null);
    try {
      const course = await firstValueFrom(this.api.getCourseByPublicId(publicId));
      this.currentCourse.set(course);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateCourseStatut(id: number, statut: CourseStatut): Promise<void> {
    const updated = await firstValueFrom(this.api.updateCourseStatut(id, statut));
    this.mesCourses.update((list) => list.map((c) => (c.id === id ? updated : c)));
    if (this.currentCourse()?.id === id) {
      this.currentCourse.set(updated);
    }
    if (statut === 'LIVREE') {
      this.mesMissions.update((list) =>
        list.map((m) =>
          m.public_id === updated.public_id ? { ...m, status: 'DELIVERED' as const } : m,
        ),
      );
    }
  }
}
