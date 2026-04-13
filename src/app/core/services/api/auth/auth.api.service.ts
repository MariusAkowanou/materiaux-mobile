import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
  TokenResponse,
  User,
  RoleRequestDto,
  UserRoleEntry,
  UpdateProfileDto,
  SupplierProfileDto,
  TransporterProfileDto,
  TruckDto,
} from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly url = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(dto: LoginDto): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/login`, dto);
  }
  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.url}/register`, dto);
  }

  verifyOtp(dto: VerifyOtpDto): Observable<User> {
    return this.http.post<User>(`${this.url}/verify-otp`, dto);
  }

  refreshToken(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/refresh`, {
      refresh_token: refreshToken,
    });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {
      refresh_token: refreshToken,
    });
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.url}/me`);
  }

  updateMe(dto: UpdateProfileDto): Observable<User> {
    return this.http.patch<User>(`${this.url}/me`, dto);
  }

  requestRole(dto: RoleRequestDto): Observable<UserRoleEntry> {
    return this.http.post<UserRoleEntry>(`${this.url}/me/roles`, dto);
  }

  getMyRoles(): Observable<UserRoleEntry[]> {
    return this.http.get<UserRoleEntry[]>(`${this.url}/me/roles`);
  }

  revokeRole(role: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/me/roles/${role}`);
  }

  createSupplierProfile(
    dto: SupplierProfileDto,
  ): Observable<SupplierProfileDto> {
    return this.http.post<SupplierProfileDto>(
      `${this.url}/me/supplier-profile`,
      dto,
    );
  }

  getSupplierProfile(): Observable<SupplierProfileDto> {
    return this.http.get<SupplierProfileDto>(`${this.url}/me/supplier-profile`);
  }

  createTransporterProfile(
    dto: TransporterProfileDto,
  ): Observable<TransporterProfileDto> {
    return this.http.post<TransporterProfileDto>(
      `${this.url}/me/transporter-profile`,
      dto,
    );
  }

  getTransporterProfile(): Observable<TransporterProfileDto> {
    return this.http.get<TransporterProfileDto>(
      `${this.url}/me/transporter-profile`,
    );
  }

  addTruck(dto: TruckDto): Observable<TruckDto> {
    return this.http.post<TruckDto>(`${this.url}/me/trucks`, dto);
  }

  getMyTrucks(): Observable<TruckDto[]> {
    return this.http.get<TruckDto[]>(`${this.url}/me/trucks`);
  }
}
