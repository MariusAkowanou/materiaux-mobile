import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { CamionType } from 'src/app/core/services/api/transport/transport.model';
import { DeliverySpeed } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-step-logistique',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './step-logistique.component.html',
})
export class StepLogistiqueComponent implements OnInit {
  private transportStore = inject(TransportStore);
  private devisStore = inject(DevisStore);

  readonly camions = this.transportStore.camionsSorted;
  readonly isLoading = this.transportStore.isLoading;
  readonly draft = this.devisStore.wizardDraft;

  // Valeurs locales pour le formulaire
  selectedCamionId: number | null = null;
  nbVoyages = 1;
  speed: DeliverySpeed = 'NORMAL';
  readonly deliverySpeeds: DeliverySpeed[] = ['NORMAL', 'RAPIDE', 'ULTRA_RAPIDE'];
  deliveryDate: string;

  constructor() {
    // Par défaut : demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.deliveryDate = tomorrow.toISOString();
  }

  ngOnInit() {
    this.transportStore.loadCamions();
    
    // Restaurer depuis le draft si existant
    const d = this.draft();
    if (d.camionTypeId) this.selectedCamionId = d.camionTypeId;
    if (d.nbVoyages) this.nbVoyages = d.nbVoyages;
    if (d.deliverySpeed) this.speed = d.deliverySpeed;
    if (d.deliveryDatetime) this.deliveryDate = d.deliveryDatetime;
  }

  selectCamion(camion: CamionType) {
    this.selectedCamionId = camion.id;
  }

  updateVoyages(delta: number) {
    const newVal = this.nbVoyages + delta;
    if (newVal >= 1) this.nbVoyages = newVal;
  }

  get selectedCamion(): CamionType | undefined {
    return this.camions().find((c: CamionType) => c.id === this.selectedCamionId);
  }

  get calculatedQuantity(): number {
    const camion = this.selectedCamion;
    if (!camion) return 0;
    return this.nbVoyages * camion.capacite_m3;
  }


  async submit() {
    if (!this.selectedCamionId) return;

    const camion = this.camions().find((c: CamionType) => c.id === this.selectedCamionId);

    // Mettre à jour le draft
    this.devisStore.updateWizard({
      camionTypeId: this.selectedCamionId,
      camionLibelle: camion?.libelle,
      nbVoyages: this.nbVoyages,
      deliveryDatetime: this.deliveryDate,
      deliverySpeed: this.speed,
    });

    // Créer le devis via l'API
    const d = this.draft();
    try {
      await this.devisStore.createQuote({
        product_id: d.productId!,
        quantity: this.calculatedQuantity,
        delivery_address: d.adresse!,
        delivery_datetime: this.deliveryDate,
        delivery_speed: this.speed
      });
      
      // Passer à l'affichage des propositions (étape 4)
      this.devisStore.goToStep(4);
    } catch (error) {
      console.error('Erreur lors de la création du devis', error);
      // Gérer l'erreur (toast, etc.)
    }
  }

  back() {
    this.devisStore.goToStep(2);
  }
}
