// ─────────────────────────────────────────────────────────────────────────────
// catalogue.model.ts — Domaine Catalogue / Matériaux
// ─────────────────────────────────────────────────────────────────────────────

export interface Categorie {
  id: number;
  public_id: string;
  nom: string;
  description: string | null;
  icon_name: string | null;
  image_url: string | null;
  transport_inclus: boolean;
  is_active: boolean;
  materiaux_count: number;
}

export interface CategorieListResponse {
  items: Categorie[];
  total: number;
}

// ── Matériau ─────────────────────────────────────────────────────────────────

export interface MateriauImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface MateriauBase {
  id: number;
  public_id: string;
  nom: string;
  description: string | null;
  unite: string;          // ex. "m³", "tonne", "sac"
  prix_indicatif_min: number | null;
  prix_indicatif_max: number | null;
  is_active: boolean;
  categorie_id: number;
  categorie: Pick<Categorie, 'id' | 'nom' | 'transport_inclus'>;
  images: MateriauImage[];
}

export interface MateriauListResponse {
  items: MateriauBase[];
  total: number;
  skip: number;
  limit: number;
}

// ── Matériau détail ──────────────────────────────────────────────────────────

export interface ParametreDefinition {
  id: number;
  nom: string;
  valeur: string;
  unite: string | null;
}

export interface MateriauDetail extends MateriauBase {
  parametres: ParametreDefinition[];
}

// ── Offre publique ────────────────────────────────────────────────────────────

export interface FournisseurPublic {
  public_id: string;
  nom_entreprise: string;
  ville: string | null;
  avatar_url: string | null;
  note_moyenne: number | null;
  nombre_avis: number;
}

export interface CarrierePublique {
  public_id: string;
  nom: string;
  commune: string | null;
  departement: string | null;
  distance_km: number | null;  // si géolocalisation disponible
}

export interface OffrePublique {
  id: number;
  public_id: string;
  prix_unitaire: number;
  unite: string;
  stock_disponible: number | null;
  delai_livraison_jours: number | null;
  is_active: boolean;
  created_at: string;
  fournisseur: FournisseurPublic;
  carriere: CarrierePublique;
  materiau_id: number;
}

// ── Params de requête ─────────────────────────────────────────────────────────

export interface MateriauxQueryParams {
  categorie_id?: number;
  search?: string;
  skip?: number;
  limit?: number;
  active_only?: boolean;
}
