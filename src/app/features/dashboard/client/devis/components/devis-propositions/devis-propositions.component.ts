import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { QuoteResponse, QuoteSummary } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-devis-propositions',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './devis-propositions.component.html',
})
export class DevisPropositionsComponent implements OnInit {
  private devisStore = inject(DevisStore);
  private toastCtrl = inject(ToastController);

  readonly quotes = this.devisStore.pendingQuotes;
  readonly isLoading = this.devisStore.isLoading;
  readonly isSubmitting = this.devisStore.isSubmitting;

  ngOnInit() {
    this.devisStore.loadMyQuotes();
  }

  async confirmOrder(quote: QuoteSummary) {
    try {
      await this.devisStore.confirmOrder(quote.public_id);
      const toast = await this.toastCtrl.create({
        message: 'Commande confirmée avec succès !',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      console.error(error);
    }
  }

  async cancelQuote(quote: QuoteSummary) {
    try {
      await this.devisStore.cancelQuote(quote.public_id);
      const toast = await this.toastCtrl.create({
        message: 'Offre annulée.',
        duration: 2000,
        color: 'medium',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      console.error(error);
    }
  }

  createNewDevis() {
    this.devisStore.resetWizard();
  }
}
