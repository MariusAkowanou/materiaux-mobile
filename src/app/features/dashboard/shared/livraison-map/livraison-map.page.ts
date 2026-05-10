import {
  Component, inject, OnInit, OnDestroy,
  signal, computed, ViewChild, ElementRef, AfterViewInit, NgZone,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { TransportStore } from 'src/app/core/services/api/transport/transport.store';
import { TransportApiService } from 'src/app/core/services/api/transport/transport.api.service';
import { AuthStore } from 'src/app/core/services/api/auth/auth.store';
import { MissionTransporteur } from 'src/app/core/services/api/transport/transport.model';
import { GoogleMapsLoaderService } from 'src/app/core/services/local/google-maps-loader.service';

declare const google: any;

@Component({
  selector: 'app-livraison-map',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner,
  ],
  templateUrl: './livraison-map.page.html',
})
export class LivraisonMapPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  private store      = inject(TransportStore);
  private api        = inject(TransportApiService);
  private authStore  = inject(AuthStore);
  private mapsLoader = inject(GoogleMapsLoaderService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private toastCtrl  = inject(ToastController);
  private alertCtrl  = inject(AlertController);
  private ngZone     = inject(NgZone);

  // ── Paramètres de route ───────────────────────────────────────────────────
  private orderId = '';

  // ── Rôle ─────────────────────────────────────────────────────────────────
  readonly isTransporter = computed(() => this.authStore.primaryRole() === 'TRANSPORTER');
  readonly isSupplier    = computed(() => this.authStore.primaryRole() === 'SUPPLIER');

  // ── État ─────────────────────────────────────────────────────────────────
  readonly mission      = signal<MissionTransporteur | null>(null);
  readonly isLoadingMap = signal(true);
  readonly isConfirming = signal(false);
  readonly isDelivered  = computed(() =>
    ['DELIVERED', 'COMPLETED'].includes(this.mission()?.status ?? ''),
  );
  readonly isInProgress = computed(() => this.mission()?.status === 'IN_PROGRESS');

  /** Transport cost nul → livraison gérée sans transporteur externe (supplier peut confirmer) */
  readonly transportCostZero = computed(() => {
    const tc = this.mission()?.quote_summary?.transport_cost;
    return !tc || parseFloat(tc) === 0;
  });

  /**
   * Bouton "Confirmer la livraison" visible :
   * - Statut IN_PROGRESS obligatoire
   * - TRANSPORTER : toujours
   * - SUPPLIER : seulement si transport_cost = 0.00 (il gère lui-même)
   */
  readonly canConfirm = computed(() => {
    if (!this.isInProgress()) return false;
    if (this.isTransporter()) return true;
    if (this.isSupplier()) return this.transportCostZero();
    return false;
  });

  // ── Infos route ───────────────────────────────────────────────────────────
  readonly distanceText = signal('—');
  readonly durationText = signal('—');
  readonly currentLat   = signal(0);
  readonly currentLng   = signal(0);

  // Computed depuis la mission
  readonly adresseLivraison = computed(
    () => this.mission()?.quote_summary?.delivery_address ?? '',
  );
  readonly orderNumber = computed(() => this.mission()?.order_number ?? '');
  readonly produitNom  = computed(
    () => this.mission()?.quote_summary?.product_name ?? 'Livraison',
  );
  readonly transportCost = computed(
    () => this.mission()?.quote_summary?.transport_cost ?? null,
  );

  // ── Google Maps ───────────────────────────────────────────────────────────
  private map!: any;
  private transporterMarker!: any;
  private destinationMarker!: any;
  private directionsRenderer!: any;
  private watchId: string | null = null;
  private mapReady  = false;
  private viewReady = false;

  // ── Cycle de vie ──────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.loadMission();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this._loadMapsAndInit();
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  // ── Chargement mission ────────────────────────────────────────────────────

  private async loadMission(): Promise<void> {
    // Cherche d'abord en mémoire
    const cached = this.store.mesMissions().find((m) => m.public_id === this.orderId);
    if (cached) { this.mission.set(cached); return; }
    try {
      const m = await firstValueFrom(this.api.getMissionByPublicId(this.orderId));
      this.mission.set(m);
    } catch {
      await this.toast('Impossible de charger les détails de la mission', 'warning');
    }
  }

  // ── Initialisation Maps ───────────────────────────────────────────────────

  private async _loadMapsAndInit(): Promise<void> {
    if (this.mapReady) return;
    try {
      await this.mapsLoader.load();
    } catch {
      this.isLoadingMap.set(false);
      await this.toast('Google Maps indisponible. Vérifiez votre connexion.', 'warning');
      return;
    }
    this.mapReady = true;
    this._initMap();
  }

  private async _initMap(): Promise<void> {
    // 1. Obtenir la position GPS actuelle de l'utilisateur
    let lat = 6.3703; // centre Cotonou par défaut
    let lng = 2.3912;

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8_000,
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      await this.toast('Position GPS non disponible — centrage sur Cotonou', 'warning');
    }

    this.currentLat.set(lat);
    this.currentLng.set(lng);

    const origin = { lat, lng };

    // 2. Créer la carte
    this.map = new google.maps.Map(this.mapContainerRef.nativeElement, {
      center: origin,
      zoom: 14,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: [
        { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    // 3. Marqueur camion (position courante)
    this.transporterMarker = new google.maps.Marker({
      position: origin,
      map: this.map,
      title: 'Ma position',
      icon: this._iconCamion(),
      zIndex: 10,
    });

    // 4. DirectionsRenderer pour le tracé
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4f46e5',
        strokeWeight: 6,
        strokeOpacity: 0.9,
      },
    });

    // 5. Tracer la route vers l'adresse de livraison
    const dest = this.adresseLivraison();
    if (dest) {
      this._tracerRoute(origin, dest);
    } else {
      this.isLoadingMap.set(false);
    }

    // 6. Suivi GPS en temps réel (transporteur seulement)
    if (this.isTransporter()) {
      this._startWatchPosition();
    }
  }

  // ── Tracé de la route ─────────────────────────────────────────────────────

  private _tracerRoute(
    origin: { lat: number; lng: number },
    destination: string,
  ): void {
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'BJ',
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (result: any, status: any) => {
        this.ngZone.run(() => {
          this.isLoadingMap.set(false);

          if (status === 'OK') {
            // Afficher le tracé
            this.directionsRenderer.setDirections(result);

            const leg = result.routes[0].legs[0];

            // Marqueur destination
            this._placerMarqueurDestination(leg.end_location);

            // Mettre à jour distance / durée
            this.distanceText.set(leg.distance?.text ?? '—');
            this.durationText.set(leg.duration?.text ?? '—');

          } else {
            // Fallback : géocoder l'adresse et afficher un marqueur simple
            this._geocoderFallback(origin, destination);
          }
        });
      },
    );
  }

  /** Géocode l'adresse si Directions échoue, place un marqueur et une ligne droite */
  private _geocoderFallback(
    origin: { lat: number; lng: number },
    address: string,
  ): void {
    new google.maps.Geocoder().geocode(
      { address, region: 'BJ' },
      (results: any, status: any) => {
        this.ngZone.run(() => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            this._placerMarqueurDestination(loc);

            // Ligne droite de secours
            new google.maps.Polyline({
              path: [origin, { lat: loc.lat(), lng: loc.lng() }],
              map: this.map,
              strokeColor: '#6366f1',
              strokeWeight: 4,
              strokeOpacity: 0.6,
              geodesic: true,
            });

            // Distance à vol d'oiseau
            const d = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(origin.lat, origin.lng),
              loc,
            );
            this.distanceText.set(`~${(d / 1000).toFixed(1)} km`);

            // Adapter le zoom pour voir les deux points
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(loc);
            this.map.fitBounds(bounds, 80);
          } else {
            this.toast('Adresse de livraison introuvable sur la carte', 'warning');
          }
        });
      },
    );
  }

  private _placerMarqueurDestination(position: any): void {
    if (!this.destinationMarker) {
      this.destinationMarker = new google.maps.Marker({
        position,
        map: this.map,
        title: 'Destination',
        icon: this._iconDestination(),
        zIndex: 9,
      });
    } else {
      this.destinationMarker.setPosition(position);
    }
  }

  // ── Suivi GPS en temps réel ───────────────────────────────────────────────

  private _startWatchPosition(): void {
    Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15_000 },
      (position, err) => {
        if (err || !position) return;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.ngZone.run(() => {
          this.currentLat.set(lat);
          this.currentLng.set(lng);
          // Déplacer le marqueur camion
          this.transporterMarker?.setPosition({ lat, lng });
          // Suivre la position (caméra suit le camion)
          this.map?.panTo({ lat, lng });
        });
      },
    ).then((id) => { this.watchId = id; })
     .catch(() => {});
  }

  // ── Confirmer la livraison ────────────────────────────────────────────────

  async confirmerLivraison(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la livraison',
      message: 'Confirmez-vous que la livraison a bien été effectuée ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Confirmer', handler: () => { this._executerConfirmation(); } },
      ],
    });
    await alert.present();
  }

  private async _executerConfirmation(): Promise<void> {
    this.isConfirming.set(true);
    try {
      await this.store.confirmerLivraison(this.orderId);
      this.mission.update((m) =>
        m ? { ...m, status: 'COMPLETED' as const, completion_pct: 100 } : m,
      );
      if (this.watchId) {
        Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
      }
      await this.toast('Livraison confirmée ! Merci 🎉', 'success');
     // setTimeout(() => this.router.navigate(['/dashboard/wallet']), 1500);
    } catch {
      await this.toast('Erreur lors de la confirmation', 'danger');
    } finally {
      this.isConfirming.set(false);
    }
  }

  // ── Recentrer sur ma position ─────────────────────────────────────────────

  recentrer(): void {
    const lat = this.currentLat();
    const lng = this.currentLng();
    if (this.map && lat && lng) {
      this.map.panTo({ lat, lng });
      this.map.setZoom(15);
    }
  }

  // ── Icônes ────────────────────────────────────────────────────────────────

  private _iconCamion(): any {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="20" fill="#4f46e5" fill-opacity="0.18"/>
      <circle cx="22" cy="22" r="15" fill="#4f46e5"/>
      <circle cx="22" cy="22" r="13" fill="#4f46e5" stroke="white" stroke-width="2"/>
      <text x="22" y="28" font-size="15" text-anchor="middle" fill="white">🚛</text>
    </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(44, 44),
      anchor: new google.maps.Point(22, 22),
    };
  }

  private _iconDestination(): any {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.4 18 26 18 26S36 30.4 36 18C36 8.06 27.94 0 18 0z" fill="#ef4444"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <circle cx="18" cy="18" r="5" fill="#ef4444"/>
    </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(36, 44),
      anchor: new google.maps.Point(18, 44),
    };
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}
