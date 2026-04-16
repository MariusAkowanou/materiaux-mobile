import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { Course, CourseStatut } from 'src/app/core/services/api/transport/transport.model';
import { CourseCardComponent } from './components/course-card/course-card.component';

type Tab = 'EN_ATTENTE' | 'EN_COURS' | 'LIVREE';

@Component({
  selector: 'app-mes-courses',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonRefresher, IonRefresherContent, IonSkeletonText, IonBadge,
    CourseCardComponent,
  ],
  templateUrl: './mes-courses.page.html',
})
export class MesCoursesPage implements OnInit {
  private store     = inject(TransportStore);
  private toastCtrl = inject(ToastController);

  readonly isLoading          = this.store.isLoading;
  readonly coursesEnAttente   = this.store.coursesEnAttente;
  readonly coursesActives     = this.store.coursesActives;
  readonly coursesTerminees   = this.store.coursesTerminees;

  readonly activeTab = signal<Tab>('EN_ATTENTE');

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'EN_ATTENTE', label: 'En attente' },
    { key: 'EN_COURS',   label: 'En cours'   },
    { key: 'LIVREE',     label: 'Terminées'  },
  ];

  get activeCourses(): Course[] {
    switch (this.activeTab()) {
      case 'EN_ATTENTE': return this.coursesEnAttente();
      case 'EN_COURS':   return this.coursesActives();
      case 'LIVREE':     return this.coursesTerminees();
    }
  }

  get countByTab(): Record<Tab, number> {
    return {
      EN_ATTENTE: this.coursesEnAttente().length,
      EN_COURS:   this.coursesActives().length,
      LIVREE:     this.coursesTerminees().length,
    };
  }

  ngOnInit() {
    this.store.loadMesCourses();
  }

  async refresh(event: CustomEvent) {
    await this.store.loadMesCourses();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async changeStatut(course: Course, statut: CourseStatut) {
    try {
      await this.store.updateCourseStatut(course.id, statut);
      const labels: Record<CourseStatut, string> = {
        EN_ATTENTE: 'en attente',
        ASSIGNEE:   'acceptée',
        EN_COURS:   'démarrée',
        LIVREE:     'livrée',
      };
      this.toast(`Course ${labels[statut]}`, 'success');

      // Passer à l'onglet suivant si la liste actuelle est vide
      if (statut === 'ASSIGNEE' && this.coursesEnAttente().length === 0) {
        this.activeTab.set('EN_COURS');
      } else if (statut === 'LIVREE' && this.coursesActives().length === 0) {
        this.activeTab.set('LIVREE');
      }
    } catch {
      this.toast('Erreur lors du changement de statut', 'danger');
    }
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
