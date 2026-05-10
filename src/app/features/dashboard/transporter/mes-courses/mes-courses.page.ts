import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonRefresher, IonRefresherContent, IonSpinner,
} from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { MissionTransporteur } from 'src/app/core/services/api/transport/transport.model';
import { CourseCardComponent } from './components/course-card/course-card.component';

type TabFilter = 'ASSIGNED' | 'IN_PROGRESS' | 'DELIVERED';

@Component({
  selector: 'app-mes-courses',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar,
    IonRefresher, IonRefresherContent, IonSpinner,
    CourseCardComponent,
  ],
  templateUrl: './mes-courses.page.html',
})
export class MesCoursesPage implements OnInit {
  private store  = inject(TransportStore);
  private router = inject(Router);

  // ── État du store ─────────────────────────────────────────────────────────
  readonly mesMissions = this.store.mesMissions;
  readonly isLoading   = this.store.isLoading;

  // ── Onglet actif ──────────────────────────────────────────────────────────
  readonly activeTab = signal<TabFilter>('ASSIGNED');

  // ── Missions filtrées selon l'onglet ─────────────────────────────────────
  readonly missionsFiltered = computed(() => {
    const tab = this.activeTab();
    return this.mesMissions().filter((m) => {
      if (tab === 'IN_PROGRESS') {
        // Regroupe "en route" + "partiellement livré"
        return m.status === 'IN_PROGRESS' || m.status === 'PARTIALLY_DELIVERED';
      }
      if (tab === 'DELIVERED') {
        return m.status === 'DELIVERED' || m.status === 'COMPLETED';
      }
      return m.status === tab;
    });
  });

  // ── Compteurs par onglet ──────────────────────────────────────────────────
  readonly countAssigned = computed(() =>
    this.mesMissions().filter((m) => m.status === 'ASSIGNED').length,
  );

  readonly countInProgress = computed(() =>
    this.mesMissions().filter(
      (m) => m.status === 'IN_PROGRESS' || m.status === 'PARTIALLY_DELIVERED',
    ).length,
  );

  readonly countDelivered = computed(() =>
    this.mesMissions().filter(
      (m) => m.status === 'DELIVERED' || m.status === 'COMPLETED',
    ).length,
  );

  // ── Cycle de vie ──────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await this.store.loadMesMissions();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  setTab(tab: TabFilter): void {
    this.activeTab.set(tab);
  }

  async handleRefresh(event: any): Promise<void> {
    await this.store.loadMesMissions();
    event.target.complete();
  }

  voirDetail(mission: MissionTransporteur): void {
    this.router.navigate(['/dashboard/transporter/courses', mission.public_id]);
  }
}
