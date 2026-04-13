import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSkeletonText,
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
    OffreCardComponent,
  ],
  templateUrl: './catalogue-detail.page.html',
})
export class CatalogueDetailPage implements OnInit {
  protected readonly store  = inject(CatalogueStore);
  private  readonly route   = inject(ActivatedRoute);
  private  readonly router  = inject(Router);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/dashboard/client/catalogue']); return; }
    await this.store.loadMateriau(id);
    await this.store.loadOffresPubliques(id);
  }

  goToDevis(offre: OffrePublique): void {
    const mat = this.store.selectedMateriau();
    if (!mat) return;
    this.router.navigate(['/dashboard/client/devis'], {
      queryParams: {
        materiau_id:  mat.public_id,
        fournisseur_id: offre.fournisseur.public_id,
        offre_id:     offre.public_id,
      },
    });
  }

  protected primaryImage(): string | null {
    const images = this.store.selectedMateriau()?.images ?? [];
    return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
  }
}
