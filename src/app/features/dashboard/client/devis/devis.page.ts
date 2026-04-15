import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Sous-composants
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
    IonicModule,
    StepAdresseComponent,
    StepProduitComponent,
    StepLogistiqueComponent,
    DevisPropositionsComponent
  ],
  templateUrl: './devis.page.html',
})
export class DevisPage implements OnInit {
  private route = inject(ActivatedRoute);
  private devisStore = inject(DevisStore);
  private catalogueStore = inject(CatalogueStore);

  readonly draft = this.devisStore.wizardDraft;
  readonly hasPending = this.devisStore.hasActivePendingQuotes;
  readonly isLoading = this.devisStore.isLoading;

  ngOnInit() {
    // 1. Charger les données initiales
    this.devisStore.loadMyQuotes();

    // 2. Vérifier si on vient d'un produit spécifique
    const productId = this.route.snapshot.queryParamMap.get('productId');
    if (productId) {
      this.handleProductDeepLink(+productId);
    }
  }

  private async handleProductDeepLink(id: number) {
    // Si on a un productId, on pré-remplit le draft et on saute l'étape 2
    // On doit charger le nom du produit pour l'affichage
    try {
      this.catalogueStore.isLoading.set(true);
      const materials = await this.catalogueStore.loadMateriaux(); // Ou charger par ID spécifiquement
      const mat = this.catalogueStore.materiaux().find(m => m.id === id);
      
      if (mat) {
        this.devisStore.updateWizard({
          productId: id,
          productName: mat.nom
        });
      }
    } finally {
      this.catalogueStore.isLoading.set(false);
    }
  }

  resetWizard() {
    this.devisStore.resetWizard();
  }

  goToStep(step: any) {
    this.devisStore.goToStep(step);
  }
}
