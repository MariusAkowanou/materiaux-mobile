import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { CatalogueStore } from '../../../../core/services/api/catalogue/catalogue.store';
import { Categorie, MateriauBase } from '../../../../core/services/api/catalogue/catalogue.model';
import { CategorieCardComponent } from './components/categorie-card/categorie-card.component';
import { MateriauCardComponent } from './components/materiau-card/materiau-card.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    CategorieCardComponent,
    MateriauCardComponent,
  ],
  templateUrl: './catalogue.page.html',
})
export class CataloguePage implements OnInit {
  protected readonly store  = inject(CatalogueStore);
  private  readonly router  = inject(Router);

  protected searchValue = signal<string>('');

  async ngOnInit(): Promise<void> {
    await this.store.loadCategories();
  }

  async onCategorieSelect(cat: Categorie): Promise<void> {
    if (this.store.selectedCategorie()?.id === cat.id) {
      // Désélectionner → afficher tous
      this.store.selectCategorie(null);
      this.store.reset();
      await this.store.loadCategories();
    } else {
      this.store.selectCategorie(cat);
      await this.store.loadMateriaux(cat.id);
    }
  }

  onSearch(event: CustomEvent): void {
    const q = (event.detail.value as string) ?? '';
    this.searchValue.set(q);
    this.store.setSearchQuery(q);
  }

  onSearchClear(): void {
    this.searchValue.set('');
    this.store.setSearchQuery('');
  }

  goToDetail(mat: MateriauBase): void {
    this.router.navigate(['/dashboard/client/catalogue', mat.public_id]);
  }

  async doRefresh(event: CustomEvent): Promise<void> {
    const cat = this.store.selectedCategorie();
    this.store.reset();
    await this.store.loadCategories();
    if (cat) await this.store.loadMateriaux(cat.id);
    (event.target as HTMLIonRefresherElement).complete();
  }
}
