import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MissionTransporteur } from 'src/app/core/services/api/transport/transport.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent {
  @Input({ required: true }) mission!: MissionTransporteur;

  /** Clic sur la carte → voir le détail */
  @Output() onVoirDetail = new EventEmitter<MissionTransporteur>();

  // ── Helpers ────────────────────────────────────────────────────────────────

  get statutLabel(): string {
    const labels: Record<string, string> = {
      ASSIGNED:            'Assignée',
      IN_PROGRESS:         'En route',
      PARTIALLY_DELIVERED: 'Part. livrée',
      DELIVERED:           'Livrée',
      COMPLETED:           'Terminée',
      CANCELLED:           'Annulée',
    };
    return labels[this.mission.status] ?? this.mission.status;
  }

  get statutBgColor(): string {
    const colors: Record<string, string> = {
      ASSIGNED:            '#f97316',   // orange
      IN_PROGRESS:         '#3b82f6',   // bleu
      PARTIALLY_DELIVERED: '#a855f7',   // violet
      DELIVERED:           '#22c55e',   // vert
      COMPLETED:           '#16a34a',   // vert foncé
      CANCELLED:           '#ef4444',   // rouge
    };
    return colors[this.mission.status] ?? '#6b7280';
  }

  get topBarColor(): string {
    return this.statutBgColor;
  }

  get produitNom(): string {
    return this.mission.quote_summary?.product_name ?? 'Matériaux';
  }

  get adresseLivraison(): string {
    return this.mission.quote_summary?.delivery_address ?? '—';
  }

  get adresseDepart(): string {
    return this.mission.quote_summary?.distance_info?.origin_address ?? null!;
  }

  get transportCost(): string | null {
    return this.mission.quote_summary?.transport_cost ?? null;
  }

  get distanceText(): string | null {
    return this.mission.quote_summary?.distance_info?.distance_text ?? null;
  }

  get durationText(): string | null {
    return this.mission.quote_summary?.distance_info?.duration_text ?? null;
  }
}
