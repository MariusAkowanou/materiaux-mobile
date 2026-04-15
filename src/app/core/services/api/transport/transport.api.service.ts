import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CamionType,
  Tarif, TarifCreate, TarifUpdate,
  Course, CourseStatut, CourseLocation,
  CalculTransportDto, CalculTransportResult,
} from './transport.model';

@Injectable({ providedIn: 'root' })
export class TransportApiService {
  private readonly url = `${environment.apiUrl}/transport`;

  constructor(private http: HttpClient) {}

  // ── Référentiel camions ────────────────────────────────────────────

  getCamions(): Observable<CamionType[]> {
    return this.http.get<CamionType[]>(`${this.url}/camions`);
  }

  // ── Tarifs ─────────────────────────────────────────────────────────

  getMesTarifs(): Observable<Tarif[]> {
    return this.http.get<Tarif[]>(`${this.url}/tarifs`);
  }

  createTarif(dto: TarifCreate): Observable<Tarif> {
    return this.http.post<Tarif>(`${this.url}/tarifs`, dto);
  }

  updateTarif(id: number, dto: TarifUpdate): Observable<Tarif> {
    return this.http.patch<Tarif>(`${this.url}/tarifs/${id}`, dto);
  }

  deleteTarif(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/tarifs/${id}`);
  }

  // ── Courses ────────────────────────────────────────────────────────

  getMesCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.url}/courses/mes`);
  }

  updateCourseStatut(id: number, statut: CourseStatut): Observable<Course> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<Course>(`${this.url}/courses/${id}/statut`, {}, { params });
  }

  getCourseLocation(id: number): Observable<CourseLocation> {
    return this.http.get<CourseLocation>(`${this.url}/courses/${id}/location`);
  }

  // ── Calcul ─────────────────────────────────────────────────────────

  calculerTransport(dto: CalculTransportDto): Observable<CalculTransportResult[]> {
    return this.http.post<CalculTransportResult[]>(`${this.url}/calcul`, dto);
  }
}
