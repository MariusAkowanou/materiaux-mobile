import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CatalogueStore } from 'src/app/core/services/api/catalogue/catalogue.store';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import {  Categorie } from 'src/app/core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-step-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './step-produit.component.html',
})
export class StepProduitComponent implements OnInit {
  private catalogueStore = inject(CatalogueStore);
  private devisStore = inject(DevisStore);

  readonly categories = this.catalogueStore.categories;
  readonly materials = this.catalogueStore.filteredMateriaux;
  readonly isLoading = this.catalogueStore.isLoading;
  readonly selectedCat = this.catalogueStore.selectedCategorie;

  ngOnInit() {
    this.catalogueStore.loadCategories();
    this.catalogueStore.loadMateriaux(this.selectedCat()?.id);
  }

  selectCategory(cat: Categorie | null) {
    this.catalogueStore.selectCategorie(cat);
    this.catalogueStore.loadMateriaux(cat?.id);
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.catalogueStore.setSearchQuery(query);
  }

  selectProduct(mat: any) {
    this.devisStore.updateWizard({
      productId:   mat.id,
      productName: mat.nom,
      uniteVente:  mat.unite_vente ?? mat.unite ?? 'm³',
      step: 3,
    });
  }

  getPrimaryImage(mat: any): string | null {
    if (!mat.images || mat.images.length === 0) return null;
    const primary = mat.images.find((img:any) => img.is_primary);
    return primary ? primary.url : mat.images[0].url;
  }
}

