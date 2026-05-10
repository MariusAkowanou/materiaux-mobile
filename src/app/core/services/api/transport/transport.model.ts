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

// ── Réseau de carrières ───────────────────────────────────────────────────────

export interface ReseauCarriereInfo {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  adresse_texte: string;
}

export interface ReseauFournisseurInfo {
  id: string;
  nom: string;
  email: string;
}

export interface ReseauMembership {
  carriere_id: number;
  est_actif: boolean;
  // Champs enrichis (API v2)
  carriere?: ReseauCarriereInfo;
  fournisseur?: ReseauFournisseurInfo;
  // Champ legacy (rétro-compat)
  carriere_nom?: string;
}

export interface ReseauTransporteur {
  transporteur_id: number;
  user_id: string;
  nom_entreprise: string;
  est_disponible: boolean;
  est_verifie: boolean;
}

export interface RejoindreMultipleDto {
  carriere_ids: number[];
}

// ── Carrières disponibles (pour le formulaire rejoindre réseau) ───────────────
// Format retourné par GET /materiaux/carrieres — utilise est_active (pas is_active)

export interface CarriereDisponible {
  id: number;
  fournisseur_id: string | null;
  nom: string;
  latitude: string | number;
  longitude: string | number;
  adresse_texte: string;
  village_id: number | null;
  est_active: boolean;
}

// ── Offres disponibles (format API imbriqué) ──────────────────────────────────

export interface OffreQuoteInfo {
  delivery_address: string;
  origin_address: string;
  distance_km: number;
  transport_cost: number;
  quantity: number;
}

export interface OffreOrderInfo {
  order_id: string;
  order_number: string;
  status: string;
  quote: OffreQuoteInfo;
}

export interface OffreDisponible {
  offre_id: number;
  order_id: string;                          // UUID — utilisé pour accepter
  statut: 'en_attente' | 'success' | 'expire';
  accepted_at: string | null;
  created_at: string;
  order: OffreOrderInfo;
  // État UX local — géré côté front uniquement
  _takenByOther?: boolean;
  _acceptedByMe?: boolean;
}

// ── Missions transporteur (commandes acceptées) ───────────────────────────────

export interface DistanceInfo {
  distance_km: string;
  distance_text: string;
  duration_text: string;
  transport_formula: string;
  origin_address: string;
  distance_simulated: boolean;
}

export interface QuoteSummary {
  public_id: string;
  product_id: number;
  product_name: string;
  product_category: string;
  quantity: string;
  delivery_address: string;
  delivery_datetime: string;
  delivery_speed: string;
  material_cost: string;
  transport_cost: string;
  total_price: string;
  distance_info: DistanceInfo | null;
  supplier_id: string;
  supplier_name: string;
  status: string;
  expires_at: string;
  created_at: string;
  is_expired: boolean;
  time_remaining_h: number;
}

export type MissionStatut = 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface MissionTransporteur {
  public_id: string;
  order_number: string;
  delivery_speed: string;
  ordered_quantity: string;
  delivered_quantity: string;
  remaining_quantity: string;
  completion_pct: number;
  assigned_transporter_name: string;
  truck_info: string | null;
  payment_method: string;
  is_paid: boolean;
  payment_confirmed_at: string | null;
  status: MissionStatut;
  created_at: string;
  quote_summary: QuoteSummary;
}

// ── Accepter une course ───────────────────────────────────────────────────────

export interface AcceptCourseResponse {
  message: string;
  order_number: string;
  status: string;
}

// ── AvailableOrder (legacy — conservé pour compatibilité WS) ─────────────────

export interface AvailableOrder {
  order_id: string;
  order_number: string;
  carriere_id: number;
  carriere_nom?: string;
  delivery_address: string;
  distance_km: number;
  quantity: number;
  product_name?: string;
  prix_transport?: number;
  _takenByOther?: boolean;
  _acceptedByMe?: boolean;
}

// ── Courses ───────────────────────────────────────────────────────────────────

export type CourseStatut = 'EN_ATTENTE' | 'ASSIGNEE' | 'EN_COURS' | 'LIVREE';

export interface Course {
  id: number;
  public_id: string;         // UUID — utilisé pour les endpoints REST /transport/orders/{id}
  order_number: string;
  product_name: string;
  client_nom: string;
  adresse_depart: string;
  adresse_arrivee: string;
  lat_depart?: number | null;
  lng_depart?: number | null;
  lat_arrivee?: number | null;
  lng_arrivee?: number | null;
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

// ── Profil transporteur ───────────────────────────────────────────────────────

export interface ProfilTransporteur {
  id: number;
  user_id: string;
  nom_entreprise: string;
  zones_intervention: string;
  description: string;
  est_verifie: boolean;
  est_disponible: boolean;
}

export interface ProfilTransporteurDto {
  nom_entreprise?: string;
  zones_intervention?: string;
  description?: string;
  est_disponible?: boolean;
}
