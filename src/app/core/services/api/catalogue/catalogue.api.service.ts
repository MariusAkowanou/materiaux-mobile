import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Categorie,
  MateriauDetail,
  MateriauListResponse,
  MateriauxQueryParams,
  OffrePublique,
} from './catalogue.model';

@Injectable({ providedIn: 'root' })
export class CatalogueApiService {
  private readonly url = `${environment.apiUrl}/materiaux`;

  constructor(private http: HttpClient) {}

  getCategories(activeOnly = true): Observable<Categorie[]> {
    const params = new HttpParams().set('active_only', String(activeOnly));
    return this.http.get<Categorie[]>(`${this.url}/categories`, { params });
  }

  getMateriaux(query: MateriauxQueryParams = {}): Observable<MateriauListResponse> {
    let params = new HttpParams();
    if (query.categorie_id != null) params = params.set('categorie_id', String(query.categorie_id));
    if (query.search)               params = params.set('search', query.search);
    if (query.skip != null)         params = params.set('skip', String(query.skip));
    if (query.limit != null)        params = params.set('limit', String(query.limit));
    if (query.active_only != null)  params = params.set('active_only', String(query.active_only));
    return this.http.get<MateriauListResponse>(this.url, { params });
  }

  getMateriau(publicId: string): Observable<MateriauDetail> {
    return this.http.get<MateriauDetail>(`${this.url}/${publicId}`);
  }

  getOffresPubliques(matPublicId: string): Observable<OffrePublique[]> {
    return this.http.get<OffrePublique[]>(`${this.url}/${matPublicId}/offres-publiques`);
  }
}
