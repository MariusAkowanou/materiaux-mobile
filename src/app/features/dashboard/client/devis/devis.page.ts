import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
} from '@ionic/angular/standalone';

import { StepAdresseComponent } from './components/step-adresse/step-adresse.component';
import { StepProduitComponent } from './components/step-produit/step-produit.component';
import { StepLogistiqueComponent } from './components/step-logistique/step-logistique.component';
import { DevisPropositionsComponent } from './components/devis-propositions/devis-propositions.component';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { CatalogueStore } from 'src/app/core/services/api/catalogue/catalogue.store';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    StepAdresseComponent,
    StepProduitComponent,
    StepLogistiqueComponent,
    DevisPropositionsComponent,
  ],
  templateUrl: './devis.page.html',
})
export class DevisPage implements OnInit {
  private route          = inject(ActivatedRoute);
  readonly devisStore    = inject(DevisStore);
  readonly catalogueStore = inject(CatalogueStore);

  readonly draft    = this.devisStore.wizardDraft;
  readonly isLoading = this.devisStore.isLoading;

  async ngOnInit(): Promise<void> {
    this.devisStore.loadMyQuotes();

    // Pré-remplissage depuis la fiche catalogue (materiau_id = slug)
    const materiauSlug = this.route.snapshot.queryParamMap.get('materiau_id');
    if (materiauSlug) {
      await this.handleMateriauDeepLink(materiauSlug);
    }
  }

  private async handleMateriauDeepLink(slug: string): Promise<void> {
    try {
      // Charger le détail si pas déjà chargé ou si c'est un autre matériau
      if (!this.catalogueStore.selectedMateriau() ||
          this.catalogueStore.selectedMateriau()!.slug !== slug) {
        await this.catalogueStore.loadMateriau(slug);
      }
      const mat = this.catalogueStore.selectedMateriau();
      if (mat) {
        // Pré-sélectionner le produit dans le wizard
        this.devisStore.updateWizard({
          productId:   mat.id,
          productName: mat.nom,
          uniteVente:  mat.unite_vente,
        });
        // Si l'adresse est déjà renseignée, sauter directement à la logistique
        if (this.draft().adresse) {
          this.devisStore.goToStep(3);
        }
        // Sinon on reste à l'étape 1 (adresse) — step-adresse ira à step 3 après
      }
    } catch {
      // Silencieux — l'utilisateur peut sélectionner manuellement
    }
  }

  resetWizard(): void {
    this.devisStore.resetWizard();
  }

  goToStep(step: 1 | 2 | 3 | 4): void {
    this.devisStore.goToStep(step);
  }
}
