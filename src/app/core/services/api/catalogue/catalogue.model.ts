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

// ── Matériau liste (réponse API /materiaux) ───────────────────────────────────
// Champs renvoyés par l'endpoint de liste (léger, sans images détaillées)

export interface MateriauListItem {
  id: number;
  slug: string;
  nom: string;
  categorie_id: number;
  categorie_nom: string;
  transport_inclus: boolean;
  unite_vente: string;
  image_principale: string | null;
  nb_offres_actives: number;
  prix_min: number | null;
  prix_max: number | null;
}

export interface MateriauListResponse {
  items: MateriauListItem[];
  total: number;
  skip: number;
  limit: number;
}

// ── Matériau image (utilisé dans le détail) ───────────────────────────────────

export interface MateriauImage {
  id: number;
  url: string;
  is_primary: boolean;
}

// ── Matériau détail (réponse API /materiaux/{slug}) ───────────────────────────

export interface ParametreDefinition {
  id: number;
  nom: string;
  valeur: string;
  unite: string | null;
}

export interface MateriauDetail {
  id: number;
  slug: string;
  nom: string;
  description: string | null;
  unite_vente: string;
  prix_min: number | null;
  prix_max: number | null;
  is_active: boolean;
  categorie_id: number;
  categorie_nom: string;
  transport_inclus: boolean;
  categorie_transport_inclus: boolean;
  images: MateriauImage[];
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
  distance_km: number | null;
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
