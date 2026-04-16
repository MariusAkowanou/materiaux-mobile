import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSkeletonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CatalogueStore } from '../../../../../core/services/api/catalogue/catalogue.store';
import { OffrePublique } from '../../../../../core/services/api/catalogue/catalogue.model';
import { OffreCardComponent } from '../components/offre-card/offre-card.component';

@Component({
  selector: 'app-catalogue-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSkeletonText,
    IonSpinner,
    OffreCardComponent,
  ],
  templateUrl: './catalogue-detail.page.html',
})
export class CatalogueDetailPage implements OnInit {
  protected readonly store  = inject(CatalogueStore);
  private  readonly route   = inject(ActivatedRoute);
  private  readonly router  = inject(Router);

  /** Active tab pour la galerie */
  protected readonly activeImageIdx = signal(0);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/dashboard/client/catalogue']); return; }
    await this.store.loadMateriau(id);
    await this.store.loadOffresPubliques(id);
  }

  /** Navigation vers devis avec offre spécifique (depuis une offre-card) */
  goToDevis(offre: OffrePublique): void {
    const mat = this.store.selectedMateriau();
    if (!mat) return;
    this.router.navigate(['/dashboard/client/devis'], {
      queryParams: {
        materiau_id:    mat.slug,
        fournisseur_id: offre.fournisseur.public_id,
        offre_id:       offre.public_id,
      },
    });
  }

  /** Navigation vers devis depuis le CTA principal (meilleure offre auto-sélectionnée) */
  goToDevisGeneral(): void {
    const mat    = this.store.selectedMateriau();
    const offres = this.store.offresPubliques();
    if (!mat) return;
    const best = offres.length > 0
      ? offres.reduce((a, b) => a.prix_unitaire <= b.prix_unitaire ? a : b)
      : null;
    this.router.navigate(['/dashboard/client/devis'], {
      queryParams: {
        materiau_id:    mat.slug,
        ...(best ? { offre_id: best.public_id, fournisseur_id: best.fournisseur.public_id } : {}),
      },
    });
  }

  protected primaryImage(): string | null {
    const images = this.store.selectedMateriau()?.images ?? [];
    return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
  }

  protected hasOffres(): boolean {
    return !this.store.isLoadingOffres() && this.store.offresPubliques().length > 0;
  }
}
