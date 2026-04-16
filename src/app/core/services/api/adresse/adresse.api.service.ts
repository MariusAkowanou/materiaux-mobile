import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Pays, Departement, Commune, Arrondissement, Village, DepartementFlat,
  ClientAddress, ClientAddressCreate,
} from './adresse.model';

@Injectable({ providedIn: 'root' })
export class AdresseApiService {
  private readonly url = `${environment.apiUrl}/adresses/adresse`;

  constructor(private http: HttpClient) {}

  // ── Référentiel géographique (Public) ────────────────────────────────────

  getPays(): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.url}/pays`);
  }

  getPaysWithTree(paysId: number): Observable<Pays> {
    return this.http.get<Pays>(`${this.url}/pays/${paysId}`);
  }

  getDepartements(paysId: number): Observable<DepartementFlat[]> {
    return this.http.get<DepartementFlat[]>(`${this.url}/pays/${paysId}/departements`);
  }

  getCommunes(departementId: number): Observable<Commune[]> {
    return this.http.get<Commune[]>(`${this.url}/departements/${departementId}/communes`);
  }

  getArrondissements(communeId: number): Observable<Arrondissement[]> {
    return this.http.get<Arrondissement[]>(`${this.url}/communes/${communeId}/arrondissements`);
  }

  getVillages(arrondissementId: number): Observable<Village[]> {
    return this.http.get<Village[]>(`${this.url}/arrondissements/${arrondissementId}/villages`);
  }

  // ── Carnet d'adresses (Authentifié) ─────────────────────────────────────

  getMesAdresses(): Observable<ClientAddress[]> {
    return this.http.get<ClientAddress[]>(`${this.url}/mes-adresses`);
  }

  addAdresse(dto: ClientAddressCreate): Observable<ClientAddress> {
    return this.http.post<ClientAddress>(`${this.url}/mes-adresses`, dto);
  }

  deleteAdresse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/mes-adresses/${id}`);
  }
}

