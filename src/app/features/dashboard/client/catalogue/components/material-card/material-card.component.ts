import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="material-card">
      <div class="image-container">
        <img [src]="primaryImage" [alt]="material.nom" onerror="this.src='assets/img/placeholder-material.png'">
        @if (material.categorie) {
          <div class="badge-category">
            {{ material.categorie.nom }}
          </div>
        }
      </div>
    
      <div class="card-content">
        <h3 class="material-name">{{ material.nom }}</h3>
        @if (material.description) {
          <p class="material-description">{{ material.description }}</p>
        }
    
        <div class="price-section">
          <div class="price-label">Prix indicatif</div>
          @if (material.prix_indicatif_min) {
            <div class="price-value">
              {{ material.prix_indicatif_min | number:'1.0-0' }} - {{ material.prix_indicatif_max | number:'1.0-0' }}
              <span class="currency">CFA / {{ material.unite }}</span>
            </div>
          } @else {
            <div class="price-value">Sur devis</div>
          }
        </div>
    
        <div class="card-footer">
          <div class="offers-count">
            <i class="pi pi-tag mr-1"></i>
            Disponibilité immédiate
          </div>
          <button class="btn-view">
            Voir
          </button>
        </div>
      </div>
    </div>
    `,
  styles: [`
    .material-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #f3f4f6;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform 0.2s ease;
    }

    .material-card:active {
        transform: scale(0.98);
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 160px;
      background: #f9fafb;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge-category {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.9);
      color: var(--ion-color-secondary);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .material-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
    }

    .material-description {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price-section {
      margin-top: auto;
      padding: 10px;
      background: #f9fafb;
      border-radius: 12px;
    }

    .price-label {
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .price-value {
      font-size: 15px;
      font-weight: 800;
      color: var(--ion-color-primary-shade);
    }

    .currency {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
    }

    .offers-count {
        font-size: 11px;
        color: #10b981;
        font-weight: 600;
        display: flex;
        align-items: center;
    }

    .btn-view {
        background: var(--ion-color-primary);
        color: var(--ion-color-dark);
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(224, 185, 57, 0.3); /* ombre subtile primaire */
    }

    .mr-1 {
        margin-right: 4px;
    }
  `]
})
export class MaterialCardComponent {
  @Input({ required: true }) material!: any;

  get primaryImage(): string {
    const primary = this.material.images?.find((img: any) => img.is_primary);
    return primary?.url || (this.material.images?.length ? this.material.images[0].url : 'assets/img/placeholder-material.png');
  }
}

