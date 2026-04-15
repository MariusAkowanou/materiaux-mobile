import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { AdresseStore } from 'src/app/core/services/api/adresse/adresse.store';
import { DevisStore } from 'src/app/core/services/api/devis/devis.store';
import { ClientAddress } from 'src/app/core/services/api/adresse/adresse.model';

@Component({
  selector: 'app-step-adresse',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './step-adresse.component.html',
})
export class StepAdresseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;
  private autocomplete: google.maps.places.Autocomplete | null = null;
  private fb = inject(FormBuilder);
  private adresseStore = inject(AdresseStore);
  private devisStore = inject(DevisStore);

  readonly addresses = this.adresseStore.mesAdresses;
  readonly isLoading = this.adresseStore.isLoadingCarnet;
  readonly isAdding = this.adresseStore.isAddingAdresse;
  readonly draft = this.devisStore.wizardDraft;

  showForm = false;
  addressForm: FormGroup;

  constructor() {
    this.addressForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      formatted_address: ['', [Validators.required, Validators.minLength(5)]],
      latitude: [null],
      longitude: [null],
      saveToCarnet: [true]
    });
  }

  ngOnInit() {
    this.adresseStore.loadMesAdresses();
  }

  ngAfterViewInit() {
    // Initialisé différé pour laisser le temps au DOM de s'ajuster si showForm change
  }

  ngOnDestroy() {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.addressForm.reset({ saveToCarnet: true });
    } else {
      // Attendre le prochain cycle pour s'assurer que l'input est dans le DOM
      setTimeout(() => this.initAutocomplete(), 100);
    }
  }

  private initAutocomplete() {
    if (!this.addressInput || this.autocomplete) return;

    this.autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
      componentRestrictions: { 
        country: ['BJ', 'BF', 'CV', 'CI', 'GM', 'GH', 'GN', 'GW', 'LR', 'ML', 'NE', 'NG', 'SN', 'SL', 'TG'] 
      },
      fields: ['address_components', 'formatted_address', 'geometry']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      if (place?.formatted_address) {
        this.addressForm.patchValue({
          formatted_address: place.formatted_address,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng()
        });
      }
    });
  }

  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      
      this.addressForm.patchValue({
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        formatted_address: `Position détectée (${coordinates.coords.latitude.toFixed(4)}, ${coordinates.coords.longitude.toFixed(4)})`
      });

      // Optionnel : Géocodage inverse si nécessaire pour avoir une adresse textuelle propre
      this.reverseGeocode(coordinates.coords.latitude, coordinates.coords.longitude);
      
    } catch (error) {
      console.error('Erreur de géolocalisation', error);
    }
  }

  private reverseGeocode(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }).then((result) => {
      if (result.results?.[0]) {
        this.addressForm.patchValue({
          formatted_address: result.results[0].formatted_address
        });
      }
    }).catch(() => { /* position détectée, adresse textuelle non disponible */ });
  }

  selectExistingAddress(addr: ClientAddress) {
    const nextStep = this.draft().productId ? 3 : 2;
    this.devisStore.updateWizard({ 
      adresse: addr.formatted_address,
      step: nextStep
    });
  }

  async submitNewAddress() {
    if (this.addressForm.invalid) return;

    const { name, formatted_address, latitude, longitude, saveToCarnet } = this.addressForm.value;

    if (saveToCarnet) {
      await this.adresseStore.addAdresse({ 
        name, 
        formatted_address,
        latitude,
        longitude
      });
    }

    const nextStep = this.draft().productId ? 3 : 2;
    this.devisStore.updateWizard({ 
      adresse: formatted_address,
      latitude,
      longitude,
      step: nextStep
    });
  }

}
