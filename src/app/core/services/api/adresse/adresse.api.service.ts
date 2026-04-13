import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Pays, Departement, Commune, Arrondissement, Village, DepartementFlat } from './adresse.model';

@Injectable({ providedIn: 'root' })
export class AdresseApiService {
  private readonly url = `${environment.apiUrl}/adresses`;

  constructor(private http: HttpClient) {}

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
}
