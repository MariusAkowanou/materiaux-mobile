import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CamionType,
  Tarif, TarifCreate, TarifUpdate,
  Course, CourseStatut, CourseLocation,
  CalculTransportDto, CalculTransportResult,
  ReseauMembership, ReseauTransporteur,
  RejoindreMultipleDto,
  CarriereDisponible,
  OffreDisponible, AcceptCourseResponse,
  MissionTransporteur,
  ProfilTransporteur, ProfilTransporteurDto,
} from './transport.model';

@Injectable({ providedIn: 'root' })
export class TransportApiService {
  private readonly url    = `${environment.apiUrl}/transport`;
  private readonly matUrl = `${environment.apiUrl}/materiaux`;
  private readonly devisUrl  = `${environment.apiUrl}`;


  constructor(private http: HttpClient) {}

  // ── Référentiel camions ────────────────────────────────────────────

  getCamions(): Observable<CamionType[]> {
    return this.http.get<CamionType[]>(`${this.url}/camions`);
  }

  // ── Profil transporteur ────────────────────────────────────────────

  getMonProfil(): Observable<ProfilTransporteur> {
    return this.http.get<ProfilTransporteur>(`${this.url}/profil`);
  }

  createProfil(dto: ProfilTransporteurDto): Observable<ProfilTransporteur> {
    return this.http.post<ProfilTransporteur>(`${this.url}/profil`, dto);
  }

  updateProfil(dto: ProfilTransporteurDto): Observable<ProfilTransporteur> {
    return this.http.patch<ProfilTransporteur>(`${this.url}/profil`, dto);
  }

  // ── Carrières disponibles (pour le formulaire rejoindre) ──────────

  getCarrieresDisponibles(): Observable<CarriereDisponible[]> {
    return this.http.get<CarriereDisponible[]>(`${this.matUrl}/carrieres`);
  }

  // ── Réseau de carrières ────────────────────────────────────────────

  getMesReseaux(): Observable<ReseauMembership[]> {
    return this.http.get<ReseauMembership[]>(`${this.url}/reseau/mes-carrieres`);
  }

  rejoindrReseau(carriereId: number): Observable<ReseauMembership> {
    return this.http.post<ReseauMembership>(`${this.url}/reseau/${carriereId}/rejoindre`, {});
  }

  quitterReseau(carriereId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/reseau/${carriereId}/quitter`);
  }

  rejoindrMultiple(dto: RejoindreMultipleDto): Observable<ReseauMembership[]> {
    return this.http.post<ReseauMembership[]>(`${this.url}/reseau/rejoindre-multiple`, dto);
  }

  getTransporteursReseau(carriereId: number): Observable<ReseauTransporteur[]> {
    return this.http.get<ReseauTransporteur[]>(`${this.url}/reseau/${carriereId}/transporteurs`);
  }

  // ── Offres disponibles (réseau) ────────────────────────────────────

  getOffresDisponibles(): Observable<OffreDisponible[]> {
    return this.http.get<OffreDisponible[]>(`${this.url}/reseau/offres`);

  }

  // ── Missions transporteur (commandes acceptées) ──────────────────── `devis/orders/?skip=${skip}&limit=${limit}

  getMesMissions(): Observable<MissionTransporteur[]> {
    return this.http.get<MissionTransporteur[]>(`${this.devisUrl}/devis/orders/`);
  }

  getMissionByPublicId(publicId: string): Observable<MissionTransporteur> {
    return this.http.get<MissionTransporteur>(`${this.devisUrl}/devis/orders/${publicId}`);
  }

  // ── Accepter une commande ──────────────────────────────────────────

  accepterCourse(orderId: string): Observable<AcceptCourseResponse> {
    return this.http.post<AcceptCourseResponse>(`${this.url}/orders/${orderId}/accepter`, {});
  }

  // ── Démarrer la livraison (en route) ──────────────────────────────

  demarrerLivraison(orderId: string): Observable<{ order_number: string; status: string }> {
    return this.http.post<{ order_number: string; status: string }>(
      `${this.devisUrl}/devis/orders/${orderId}/start-delivery`, {},
    );
  }

  // ── Confirmer la livraison (livrée) ────────────────────────────────

  confirmerLivraison(orderId: string): Observable<{ order_number: string; status: string }> {
    return this.http.post<{ order_number: string; status: string }>(
      `${this.devisUrl}/devis/orders/${orderId}/confirm-delivery`, {},
    );
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

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.url}/courses/${id}`);
  }

  getCourseByPublicId(publicId: string): Observable<Course> {
    return this.http.get<Course>(`${this.url}/courses/${publicId}`);
  }

  updateCourseStatut(id: number, statut: CourseStatut): Observable<Course> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<Course>(`${this.url}/courses/${id}/statut`, {}, { params });
  }

  getCourseLocation(id: number): Observable<CourseLocation> {
    return this.http.get<CourseLocation>(`${this.url}/courses/${id}/location`);
  }

  updateCourseLocation(id: number, lat: number, lng: number): Observable<void> {
    return this.http.post<void>(`${this.url}/courses/${id}/location`, { lat, lng });
  }

  // ── Calcul ─────────────────────────────────────────────────────────

  calculerTransport(dto: CalculTransportDto): Observable<CalculTransportResult[]> {
    return this.http.post<CalculTransportResult[]>(`${this.url}/calcul`, dto);
  }
}
