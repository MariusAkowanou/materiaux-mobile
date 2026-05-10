export interface Village {
  id: number;
  name: string;
  arrondissement_id: number;
}

export interface Arrondissement {
  id: number;
  name: string;
  commune_id: number;
  villages: Village[];
}

export interface Commune {
  id: number;
  name: string;
  departement_id: number;
  arrondissements: Arrondissement[];
}

export interface Departement {
  id: number;
  name: string;
  pays_id: number;
  transport_multiplier: number;
  communes: Commune[];
}

export interface Pays {
  id: number;
  name: string;
  departements: Departement[];
}

export interface DepartementFlat {
  id: number;
  pays_id: number;
  name: string;
  transport_multiplier: number;
}

// ── Carnet d'adresses client ──────────────────────────────────────────────────

export interface ClientAddress {
  id: string;
  name: string;             // ex: "Chantier Cocotiers"
  formatted_address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ClientAddressCreate {
  name: string;
  formatted_address: string;
  lat?: number;
  lng?: number;
}


