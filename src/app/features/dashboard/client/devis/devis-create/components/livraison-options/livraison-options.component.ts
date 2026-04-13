import { Component, input, output, signal } from '@angular/core';
import { DeliverySpeed } from '../../../../../../../core/services/api/devis/devis.model';

interface SpeedOption {
  value: DeliverySpeed;
  label: string;
  description: string;
  icon: string;
  delay: string;
}

export interface LivraisonSelection {
  delivery_datetime: string;
  delivery_speed: DeliverySpeed;
}

const SPEED_OPTIONS: SpeedOption[] = [
  {
    value: 'NORMAL',
    label: 'Standard',
    description: 'Délai normal, tarif de base',
    icon: 'pi-clock',
    delay: '2–5 jours',
  },
  {
    value: 'RAPIDE',
    label: 'Rapide',
    description: 'Livraison prioritaire',
    icon: 'pi-bolt',
    delay: '24–48h',
  },
  {
    value: 'ULTRA_RAPIDE',
    label: 'Ultra rapide',
    description: 'Livraison en urgence',
    icon: 'pi-send',
    delay: '< 24h',
  },
];

@Component({
  selector: 'app-livraison-options',
  standalone: true,
  imports: [],
  template: `
    <div class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <i class="pi pi-calendar text-[16px]" style="color: var(--color-primary)"></i>
        <p class="text-[13px] font-bold text-gray-700">Options de livraison</p>
      </div>

      <div class="px-4 py-3 flex flex-col gap-4">

        <!-- Date de livraison souhaitée -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Date souhaitée
          </label>
          <input
            type="datetime-local"
            [min]="minDate()"
            [value]="selectedDate()"
            class="w-full rounded-xl border border-gray-200 bg-[var(--color-surface)]
                   px-3 py-2.5 text-[14px] text-gray-800
                   focus:outline-none focus:border-[var(--color-primary)]"
            (change)="onDateChange($event)"
          />
        </div>

        <!-- Vitesse de livraison -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Vitesse de livraison
          </label>
          <div class="flex flex-col gap-2">
            @for (opt of speedOptions; track opt.value) {
              <button
                class="flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left
                       transition-all duration-150 active:scale-[0.98]"
                [class.border-[var(--color-primary)]]="selectedSpeed() === opt.value"
                [class.bg-orange-50]="selectedSpeed() === opt.value"
                [class.border-gray-100]="selectedSpeed() !== opt.value"
                (click)="selectSpeed(opt.value)"
              >
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-none"
                     [class.bg-[var(--color-primary)]]="selectedSpeed() === opt.value"
                     [class.bg-gray-100]="selectedSpeed() !== opt.value">
                  <i class="pi text-[16px] leading-none"
                     [class]="opt.icon"
                     [style.color]="selectedSpeed() === opt.value ? '#fff' : '#9CA3AF'"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-gray-800">{{ opt.label }}</p>
                  <p class="text-[11px] text-gray-400">{{ opt.description }}</p>
                </div>
                <span class="flex-none text-[11px] font-medium px-2 py-0.5 rounded-full"
                      [class.bg-orange-100]="selectedSpeed() === opt.value"
                      [class.text-[var(--color-primary)]]="selectedSpeed() === opt.value"
                      [class.bg-gray-100]="selectedSpeed() !== opt.value"
                      [class.text-gray-400]="selectedSpeed() !== opt.value">
                  {{ opt.delay }}
                </span>
              </button>
            }
          </div>
        </div>

      </div>
    </div>
  `,
})
export class LivraisonOptionsComponent {
  readonly selectionChange = output<LivraisonSelection>();

  protected readonly speedOptions = SPEED_OPTIONS;
  protected readonly selectedSpeed = signal<DeliverySpeed>('NORMAL');
  protected readonly selectedDate  = signal<string>(this.defaultDate());

  protected minDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  private defaultDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 16);
  }

  selectSpeed(speed: DeliverySpeed): void {
    this.selectedSpeed.set(speed);
    this.emit();
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedDate.set(value);
    this.emit();
  }

  private emit(): void {
    this.selectionChange.emit({
      delivery_datetime: new Date(this.selectedDate()).toISOString(),
      delivery_speed: this.selectedSpeed(),
    });
  }
}
