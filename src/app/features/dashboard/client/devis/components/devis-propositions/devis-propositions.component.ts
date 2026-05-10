import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonSpinner } from '@ionic/angular/standalone';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { QuoteResponse } from 'src/app/core/services/api/devis/devis.model';

@Component({
  selector: 'app-devis-propositions',
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonSpinner],
  templateUrl: './devis-propositions.component.html',
})
export class DevisPropositionsComponent {
  private devisStore  = inject(DevisStore);
  private router      = inject(Router);

  readonly quotes      = this.devisStore.currentQuotes;
  readonly draft       = this.devisStore.wizardDraft;
  readonly isConfirming = signal<string | null>(null);

  /** Parse a Decimal string to number for display */
  num(v: string | number | undefined): number {
    if (v == null) return 0;
    return typeof v === 'string' ? parseFloat(v) : v;
  }

  async confirmOrder(quote: QuoteResponse): Promise<void> {
    if (!quote.can_be_ordered || this.isConfirming() !== null) return;
    this.isConfirming.set(quote.public_id);
    try {
      await this.devisStore.confirmOrder(quote.public_id);
      this.devisStore.resetWizard();
      this.router.navigate(['/dashboard/client/commandes']);
    } catch {
      // ErrorInterceptor handles toast
    } finally {
      this.isConfirming.set(null);
    }
  }

  newDevis(): void {
    this.devisStore.resetWizard();
  }
}
