export type OffreStatut = 'ACTIVE' | 'EN_RUPTURE' | 'ARCHIVEE';

// ── Carrières ─────────────────────────────────────────────────────────────────

export interface Carriere {
  id: number;
  public_id: string;
  nom: string;
  adresse_texte: string;
  latitude: number;
  longitude: number;
  village_id: number | null;
  village_nom: string | null;
  commune_nom: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CarriereCreate {
  nom: string;
  adresse_texte: string;
  latitude: number;
  longitude: number;
  village_id?: number;
}

export interface CarriereUpdate {
  nom?: string;
  adresse_texte?: string;
  latitude?: number;
  longitude?: number;
}

// ── Camion type (référentiel transport) ───────────────────────────────────────

export interface CamionType {
  id: number;
  libelle: string;
  capacite_m3: number;
  charge_utile_tonne: number;
  est_actif: boolean;
}

// ── Offres fournisseur ────────────────────────────────────────────────────────

export interface OffreFournisseur {
  id: number;
  public_id: string;
  materiau_id: number;
  materiau_nom: string;
  materiau_unite: string;
  carriere_id: number;
  carriere_nom: string;
  prix_unitaire: number;
  camion_type_id: number | null;
  camion_libelle: string | null;
  transport_propre: boolean;
  prix_transport_sep: number | null;
  quantite_min_commande: number | null;
  delai_livraison_jours: number | null;
  statut: OffreStatut;
  created_at: string;
}

export interface OffreFournisseurCreate {
  materiau_id: number;
  carriere_id: number;
  prix_unitaire: number;
  camion_type_id?: number;
  transport_propre: boolean;
  prix_transport_sep?: number;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;
}

export interface OffreFournisseurUpdate {
  prix_unitaire?: number;
  transport_propre?: boolean;
  prix_transport_sep?: number;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;
}
