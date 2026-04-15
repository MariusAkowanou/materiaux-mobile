import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Carriere, CarriereCreate, CarriereUpdate,
  CamionType,
  OffreFournisseur, OffreFournisseurCreate, OffreFournisseurUpdate,
  OffreStatut,
} from './materiaux.model';

@Injectable({ providedIn: 'root' })
export class MateriauxApiService {
  private readonly matUrl  = `${environment.apiUrl}/materiaux`;
  private readonly transUrl = `${environment.apiUrl}/transport`;

  constructor(private http: HttpClient) {}

  // ── Carrières ──────────────────────────────────────────────────────

  getMesCarrieres(): Observable<Carriere[]> {
    return this.http.get<Carriere[]>(`${this.matUrl}/carrieres/mes`);
  }

  createCarriere(dto: CarriereCreate): Observable<Carriere> {
    return this.http.post<Carriere>(`${this.matUrl}/carrieres`, dto);
  }

  updateCarriere(id: number, dto: CarriereUpdate): Observable<Carriere> {
    return this.http.patch<Carriere>(`${this.matUrl}/carrieres/${id}`, dto);
  }

  deleteCarriere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.matUrl}/carrieres/${id}`);
  }

  // ── Offres ─────────────────────────────────────────────────────────

  getMesOffres(): Observable<OffreFournisseur[]> {
    return this.http.get<OffreFournisseur[]>(`${this.matUrl}/offres/mes`);
  }

  createOffre(dto: OffreFournisseurCreate): Observable<OffreFournisseur> {
    return this.http.post<OffreFournisseur>(`${this.matUrl}/offres`, dto);
  }

  updateOffre(id: number, dto: OffreFournisseurUpdate): Observable<OffreFournisseur> {
    return this.http.patch<OffreFournisseur>(`${this.matUrl}/offres/${id}`, dto);
  }

  updateOffreStatut(id: number, statut: OffreStatut): Observable<OffreFournisseur> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<OffreFournisseur>(`${this.matUrl}/offres/${id}/statut`, {}, { params });
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.matUrl}/offres/${id}`);
  }

  // ── Référentiel camions (transport) ────────────────────────────────

  getCamionTypes(): Observable<CamionType[]> {
    return this.http.get<CamionType[]>(`${this.transUrl}/camions`);
  }
}
