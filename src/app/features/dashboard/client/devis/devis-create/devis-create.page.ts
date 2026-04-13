import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { DevisStore } from '../../../../../core/services/api/devis/devis.store';
import { CatalogueStore } from '../../../../../core/services/api/catalogue/catalogue.store';
import { QuoteResponse, DeliverySpeed } from '../../../../../core/services/api/devis/devis.model';
import { OffrePublique } from '../../../../../core/services/api/catalogue/catalogue.model';
import { MateriauRecapComponent } from './components/materiau-recap/materiau-recap.component';
import { AdresseSelectorComponent, AdresseSelection } from './components/adresse-selector/adresse-selector.component';
import { LivraisonOptionsComponent, LivraisonSelection } from './components/livraison-options/livraison-options.component';
import { DevisRecapComponent } from './components/devis-recap/devis-recap.component';

type Step = 'form' | 'loading' | 'recap';

@Component({
  selector: 'app-devis-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
    MateriauRecapComponent,
    AdresseSelectorComponent,
    LivraisonOptionsComponent,
    DevisRecapComponent,
  ],
  templateUrl: './devis-create.page.html', 
})
export class DevisCreatePage implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly fb          = inject(FormBuilder);
   readonly devisStore  = inject(DevisStore);
  private readonly catStore    = inject(CatalogueStore);
  private readonly toastCtrl   = inject(ToastController);

  readonly step          = signal<Step>('form');
  readonly quoteResult   = signal<QuoteResponse | null>(null);
  readonly selectedOffre = signal<OffrePublique | null>(null);

  form: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(0.1)]],
  });

  private adresseSelection: AdresseSelection = {
    departement_id: null, commune_id: null, arrondissement_id: null,
    village_id: null, adresse_libre: '', full_address: '',
  };
  private livraisonSelection: LivraisonSelection = {
    delivery_datetime: new Date(Date.now() + 2 * 86400000).toISOString(),
    delivery_speed: 'NORMAL',
  };

  async ngOnInit(): Promise<void> {
    const offreId = this.route.snapshot.queryParamMap.get('offre_id');
    const matId   = this.route.snapshot.queryParamMap.get('materiau_id');

    if (offreId && this.catStore.offresPubliques().length > 0) {
      const offre = this.catStore.offresPubliques().find((o) => o.public_id === offreId);
      if (offre) this.selectedOffre.set(offre);
    } else if (matId) {
      await this.catStore.loadOffresPubliques(matId);
      const offreId2 = this.route.snapshot.queryParamMap.get('offre_id');
      const offre = this.catStore.offresPubliques().find((o) => o.public_id === offreId2);
      if (offre) this.selectedOffre.set(offre);
    }
  }

  onAdresseChange(sel: AdresseSelection): void {
    this.adresseSelection = sel;
  }

  onLivraisonChange(sel: LivraisonSelection): void {
    this.livraisonSelection = sel;
  }

  async submitQuote(): Promise<void> {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    if (!this.adresseSelection.full_address) {
      this.showToast('Veuillez saisir une adresse de livraison', 'warning');
      return;
    }
    const offre = this.selectedOffre();
    if (!offre) {
      this.showToast('Aucun matériau sélectionné', 'warning');
      return;
    }

    this.step.set('loading');
    try {
      const result = await this.devisStore.createQuote({
        product_id:       offre.materiau_id,
        quantity:         this.form.value.quantity,
        delivery_address: this.adresseSelection.full_address,
        delivery_datetime: this.livraisonSelection.delivery_datetime,
        delivery_speed:   this.livraisonSelection.delivery_speed,
      });
      this.quoteResult.set(result);
      this.step.set('recap');
    } catch {
      this.step.set('form');
    }
  }

  async confirmOrder(): Promise<void> {
    const q = this.quoteResult();
    if (!q) return;
    try {
      const order = await this.devisStore.confirmOrder(q.public_id);
      this.showToast('Commande confirmée !', 'success');
      this.router.navigate(['/dashboard/client/commandes', order.public_id]);
    } catch {}
  }

  goToList(): void {
    this.router.navigate(['/dashboard/client/devis']);
  }

  private async showToast(msg: string, color: 'success' | 'warning' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'top' });
    await toast.present();
  }
}
