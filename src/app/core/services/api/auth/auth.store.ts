import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { AuthApiService } from './auth.api.service';
import { LoginDto, RegisterDto, User, UserRole, VerifyOtpDto } from './auth.model';
import { StorageService } from '../../local/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private readonly _currentUser = new BehaviorSubject<User | null>(null);
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal(false);

  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly primaryRole = computed(() => this.currentUser()?.primary_role ?? null);
  readonly isHybrid = computed(() => this.currentUser()?.is_hybrid ?? false);

  readonly currentUser$: Observable<User | null> = this._currentUser.asObservable();
  readonly isLoggedIn$: Observable<boolean> = this._currentUser.pipe(map(u => !!u));

  constructor(
    private authApi: AuthApiService,
    private storage: StorageService,
    private router: Router,
  ) {}

  login(dto: LoginDto): Observable<void> {
    this._isLoading.next(true);
    this.isLoading.set(true);

    return this.authApi.login(dto).pipe(
      tap(async (res) => {
        await this.storage.setTokens(res.access_token, res.refresh_token);
        this._currentUser.next(res.user);
        this.currentUser.set(res.user);
      }),
      map(() => void 0),
      finalize(() => {
        this._isLoading.next(false);
        this.isLoading.set(false);
      }),
    );
  }

  register(dto: RegisterDto): Observable<User> {
    this._isLoading.next(true);
    this.isLoading.set(true);

    return this.authApi.register(dto).pipe(
      finalize(() => {
        this._isLoading.next(false);
        this.isLoading.set(false);
      }),
    );
  }

  verifyOtp(dto: VerifyOtpDto): Observable<User> {
    this._isLoading.next(true);
    this.isLoading.set(true);

    return this.authApi.verifyOtp(dto).pipe(
      tap((user) => {
        this._currentUser.next(user);
        this.currentUser.set(user);
      }),
      finalize(() => {
        this._isLoading.next(false);
        this.isLoading.set(false);
      }),
    );
  }

  private loadPromise: Promise<void> | null = null;

  async logout(): Promise<void> {
    const refreshToken = await this.storage.getRefreshToken();
    if (refreshToken) {
      this.authApi.logout(refreshToken).subscribe();
    }
    await this.storage.clearTokens();
    this._currentUser.next(null);
    this.currentUser.set(null);
    this.loadPromise = null;
    this.router.navigate(['/auth/login']);
  }

  async loadCurrentUser(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    const token = await this.storage.getAccessToken();
    if (!token) return;

    this.loadPromise = new Promise<void>((resolve) => {
      this.authApi.getMe().subscribe({
        next: (user) => {
          this._currentUser.next(user);
          this.currentUser.set(user);
          resolve();
        },
        error: async () => {
          // Si on n'a pas pu charger l'utilisateur, on nettoie
          // Mais on ne le fait que si on n'a pas déjà un utilisateur (évite de vider sur une erreur passagère)
          if (!this.currentUser()) {
            await this.storage.clearTokens();
          }
          this.loadPromise = null;
          resolve();
        },
      });
    });

    return this.loadPromise;
  }

  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }
}
