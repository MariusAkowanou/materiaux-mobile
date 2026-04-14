import { Component, OnInit, inject } from '@angular/core';

import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonSearchbar,
  IonButtons,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail
} from '@ionic/angular/standalone';
import { CatalogueStore } from '../../../../core/services/api/catalogue/catalogue.store';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import { MaterialCardComponent } from './components/material-card/material-card.component';
import { Categorie } from '../../../../core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonButtons,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    CategoryFilterComponent,
    MaterialCardComponent
],
   templateUrl: `./catalogue.page.html`,
  styleUrls: [`./catalogue.page.scss`],

})
export class CataloguePage implements OnInit {
  readonly store = inject(CatalogueStore);

  async ngOnInit() {
    // On charge les catégories en premier
    await this.store.loadCategories();
    // On charge les matériaux (initialement tous ou selon la sélection stockée)
    await this.store.loadMateriaux(this.store.selectedCategorie()?.id);
  }

  async handleRefresh(event: any) {
    try {
      if (this.store.selectedCategorie()) {
        await this.store.loadMateriaux(this.store.selectedCategorie()?.id);
      } else {
        await this.store.loadMateriaux();
      }
    } finally {
      event.target.complete();
    }
  }

  onCategorySelected(cat: Categorie | null) {
    this.store.selectCategorie(cat);
    this.store.loadMateriaux(cat?.id);
  }

  onSearch(event: any) {
    this.store.setSearchQuery(event.target.value);
  }

  goToDetail(publicId: string) {
    console.log('Navigating to material:', publicId);
    // TODO: Implémenter la navigation vers le détail
  }
}
