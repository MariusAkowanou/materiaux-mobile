import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Categorie } from 'src/app/core/services/api/catalogue/catalogue.model';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [],
  template: `
    <div class="category-scroll-container">
      <div
        class="category-chip"
        [class.active]="!selectedId"
        (click)="selectCategory(null)"
        >
        Tous
      </div>
    
      @for (cat of categories; track cat) {
        <div
          class="category-chip"
          [class.active]="selectedId === cat.id"
          (click)="selectCategory(cat)"
          >
          @if (cat.icon_name) {
            <i [class]="'pi ' + cat.icon_name + ' mr-1'"></i>
          }
          {{ cat.nom }}
        </div>
      }
    </div>
    `,
  styles: [`
    .category-scroll-container {
      display: flex;
      overflow-x: auto;
      padding: 12px 16px;
      gap: 10px;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
      background: white;
    }

    .category-scroll-container::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .category-chip {
      flex: 0 0 auto;
      padding: 8px 16px;
      border-radius: 20px;
      background: #f3f4f6;
      color: #4b5563;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .category-chip.active {
      background: var(--ion-color-secondary);
      color: white;
      border-color: var(--ion-color-secondary);
    }

    .mr-1 {
      margin-right: 4px;
    }
  `]
})
export class CategoryFilterComponent {
  @Input() categories: Categorie[] = [];
  @Input() selectedId: number | null = null;
  @Output() categorySelected = new EventEmitter<Categorie | null>();

  selectCategory(cat: Categorie | null) {
    this.categorySelected.emit(cat);
  }
}
