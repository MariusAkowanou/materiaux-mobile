import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal, IonDatetime, IonDatetimeButton,
  IonItem, IonSpinner,
} from '@ionic/angular/standalone';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { CamionType } from 'src/app/core/services/api/transport/transport.model';
import { DeliverySpeed } from 'src/app/core/services/api/devis/devis.model';

export type UniteMode = 'm3' | 'tonne';

@Component({
  selector: 'app-step-logistique',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, FormsModule,
    IonModal, IonDatetime, IonDatetimeButton, IonItem, IonSpinner,
  ],
  templateUrl: './step-logistique.component.html',
})
export class StepLogistiqueComponent implements OnInit {
  private transportStore = inject(TransportStore);
  private devisStore     = inject(DevisStore);

  readonly camions   = this.transportStore.camionsSorted;
  readonly isLoading = this.transportStore.isLoading;
  readonly draft     = this.devisStore.wizardDraft;

  // ── Formulaire ────────────────────────────────────────────────────
  quantite       = signal<number | null>(null);
  uniteMode      = signal<UniteMode>('m3');
  speed: DeliverySpeed = 'NORMAL';
  deliveryDate: string;
  deliveryMin:  string;
  isSubmitting   = signal(false);

  /** Limite backend : max 50 unités par devis */
  readonly MAX_QTE = 50;
  /** Exposé au template pour Math.min() */
  readonly Math = Math;

  readonly deliverySpeeds: { value: DeliverySpeed; label: string; icon: string; desc: string }[] = [
    { value: 'NORMAL',       label: 'Standard', icon: 'pi-clock', desc: '3–5 jours' },
    { value: 'RAPIDE',       label: 'Rapide',   icon: 'pi-send',  desc: '24–48 h'   },
    { value: 'ULTRA_RAPIDE', label: 'Express',  icon: 'pi-bolt',  desc: 'Même jour' },
  ];

  // ── Fallbacks camion de référence (6 roues) ───────────────────────
  private readonly REF_M3    = 14;
  private readonly REF_TONNE = 10;
  private readonly REF_LABEL = '6 roues';

  constructor() {
    // Livraison min = maintenant + 26 h (buffer > 24 h requis par l'API)
    const minDate = new Date(Date.now() + 26 * 3600 * 1000);
    this.deliveryMin  = minDate.toISOString();
    this.deliveryDate = minDate.toISOString();
  }

  ngOnInit(): void {
    this.transportStore.loadCamions();

    const d = this.draft();
    // Restaurer unité depuis le draft (voyage → tonne par défaut)
    const rawUnite = (d.uniteVente ?? '').toLowerCase();
    if (rawUnite.includes('tonne') || rawUnite === 't') {
      this.uniteMode.set('tonne');
    } else {
      this.uniteMode.set('m3');
    }

    if (d.quantite)         this.quantite.set(d.quantite);
    if (d.deliverySpeed)    this.speed = d.deliverySpeed;
    if (d.deliveryDatetime) {
      const saved = new Date(d.deliveryDatetime);
      // Utiliser uniquement si encore dans le futur avec le buffer
      if (saved.getTime() > Date.now() + 25 * 3600 * 1000) {
        this.deliveryDate = d.deliveryDatetime;
      }
    }
  }

  // ── Libellé de l'unité sélectionnée ──────────────────────────────
  get uniteLabel(): string {
    return this.uniteMode() === 'tonne' ? 'tonne' : 'm³';
  }

  get uniteShort(): string {
    return this.uniteMode() === 'tonne' ? 't' : 'm³';
  }

  // ── Vérifie si on peut proposer le toggle m³/tonne ───────────────
  // (seulement si l'unité du matériau n'est pas "voyage" ou "sac")
  get showUniteToggle(): boolean {
    const u = (this.draft().uniteVente ?? '').toLowerCase();
    return !['voyage', 'sac', 'unité'].includes(u);
  }

  // ── Camion de référence (le plus petit = 6 roues) ─────────────────
  get camionRef(): CamionType | null {
    const list = this.camions();
    return list.length ? list.reduce((min, c) => c.capacite_m3 < min.capacite_m3 ? c : min) : null;
  }

  get refCapacite(): number {
    return this.uniteMode() === 'tonne'
      ? (this.camionRef?.charge_utile_tonne ?? this.REF_TONNE)
      : (this.camionRef?.capacite_m3       ?? this.REF_M3);
  }

  get refLibelle(): string {
    return this.camionRef?.libelle ?? this.REF_LABEL;
  }

  // ── Estimation voyages ────────────────────────────────────────────
  get nbVoyages(): number {
    const q = this.quantite();
    return q && q > 0 ? Math.ceil(q / this.refCapacite) : 0;
  }

  get pctDernierVoyage(): number {
    const q = this.quantite();
    if (!q || q <= 0) return 0;
    const frac = (q % this.refCapacite) / this.refCapacite;
    return frac === 0 ? 100 : Math.round(frac * 100);
  }

  // ── Équivalent dans l'autre unité (info) ─────────────────────────
  get equivalentAutreUnite(): string {
    const q = this.quantite();
    if (!q || q <= 0 || !this.camionRef) return '';
    const ratio = this.camionRef.charge_utile_tonne / this.camionRef.capacite_m3;
    if (this.uniteMode() === 'm3') {
      return `≈ ${(q * ratio).toFixed(1)} tonne${q * ratio > 1 ? 's' : ''}`;
    } else {
      return `≈ ${(q / ratio).toFixed(1)} m³`;
    }
  }

  // ── Validation ────────────────────────────────────────────────────
  get erreurQuantite(): string | null {
    const q = this.quantite();
    if (q === null) return null;
    if (q <= 0)        return 'La quantité doit être supérieure à 0.';
    if (q > this.MAX_QTE)
      return `Maximum ${this.MAX_QTE} ${this.uniteLabel} par devis. Créez plusieurs devis pour de plus grandes quantités.`;
    return null;
  }

  get quantiteValide(): boolean {
    return this.erreurQuantite === null && (this.quantite() ?? 0) > 0;
  }

  // ── Toggle unité avec conversion ─────────────────────────────────
  switchUnite(mode: UniteMode): void {
    if (mode === this.uniteMode()) return;
    const q = this.quantite();
    if (q && this.camionRef) {
      const ratio = this.camionRef.charge_utile_tonne / this.camionRef.capacite_m3;
      const converti = mode === 'tonne' ? q * ratio : q / ratio;
      this.quantite.set(Math.round(converti * 10) / 10);
    }
    this.uniteMode.set(mode);
  }

  // ── Soumettre ─────────────────────────────────────────────────────
  async submit(): Promise<void> {
    if (!this.quantiteValide) return;

    this.isSubmitting.set(true);
    this.devisStore.updateWizard({
      quantite:         this.quantite()!,
      uniteVente:       this.uniteLabel,
      nbVoyages:        this.nbVoyages,
      deliveryDatetime: this.deliveryDate,
      deliverySpeed:    this.speed,
    });

    const d = this.draft();
    try {
      await this.devisStore.createQuote({
        product_id:        d.productId!,
        quantity:          this.quantite()!,
        delivery_address:  d.adresse!,
        delivery_datetime: this.deliveryDate,
        delivery_speed:    this.speed,
      });
      this.devisStore.goToStep(4);
    } catch {
      // ErrorInterceptor gère le toast
    } finally {
      this.isSubmitting.set(false);
    }
  }

  back(): void {
    this.devisStore.goToStep(2);
  }
}
