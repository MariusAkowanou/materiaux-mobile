// ── Types de camions (Référentiel admin) ──────────────────────────────────────

export interface CamionType {
  id: number;
  libelle: string;
  capacite_m3: number;
  charge_utile_tonne: number;
  description: string;
  est_actif: boolean;
  ordre: number;
}

// ── Tarifs transporteur ───────────────────────────────────────────────────────

export type ModeTarif = 'km' | 'voyage';

export interface Tarif {
  id: number;
  camion_type_id: number;
  camion_libelle: string;
  camion_capacite_m3: number;
  mode_tarif: ModeTarif;
  prix: number;         // FCFA/km ou FCFA/voyage
  created_at: string;
}

export interface TarifCreate {
  camion_type_id: number;
  mode_tarif: ModeTarif;
  prix: number;
}

export interface TarifUpdate {
  prix: number;
}

// ── Courses ───────────────────────────────────────────────────────────────────

export type CourseStatut = 'EN_ATTENTE' | 'ASSIGNEE' | 'EN_COURS' | 'LIVREE';

export interface Course {
  id: number;
  public_id: string;
  order_number: string;
  product_name: string;
  client_nom: string;
  adresse_depart: string;
  adresse_arrivee: string;
  distance_km: number | null;
  nb_voyages: number;
  camion_libelle: string | null;
  statut: CourseStatut;
  prix_transport: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseLocation {
  course_id: number;
  lat: number;
  lng: number;
  heading: number | null;
}

// ── Calcul de transport ───────────────────────────────────────────────────────

export interface CalculTransportDto {
  camion_type_id: number;
  nb_voyages: number;
  lat_depart: number;
  lng_depart: number;
  lat_arrivee: number;
  lng_arrivee: number;
}

export interface CalculTransportResult {
  transporteur_id: string;
  transporteur_nom: string;
  camion_type_id: number;
  camion_libelle: string;
  nb_voyages: number;
  distance_km: number;
  cout_transport: number;
  delai_livraison_h: number;
}
