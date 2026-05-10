# CLAUDE.md — Matériaux Express (Application Mobile)

## Vue d'ensemble du projet

**Matériaux Express** est une marketplace B2B de matériaux de construction au Bénin,
développée pour **Sogetrap**. L'application mobile connecte des clients (chefs de chantier,
entrepreneurs), des fournisseurs (carrières, dépôts) et des transporteurs sur une seule
plateforme avec devis géolocalisés, paiement Mobile Money et suivi de livraison en temps réel.

---

## Stack Technique

- **Framework** : Angular (dernière version stable)
- **UI Mobile** : Ionic Framework + composants Ionic natifs
- **Runtime natif** : Capacitor (iOS & Android)
- **Langage** : TypeScript strict (`strict: true` dans `tsconfig.json`)
- **Styles** : Tailwind CSS v4 + variables CSS Ionic (`--ion-color-*`)
- **Icônes** : PrimeIcons (`pi pi-*`)
- **State Management** : Pattern Store maison avec `BehaviorSubject` / `signal()`
- **HTTP** : `HttpClient` Angular avec intercepteurs
- **Formulaires** : Reactive Forms exclusivement (`FormGroup`, `FormControl`)

---

## Architecture du Projet

```
src/
├── app/
│   │
│   ├── core/                            # Singletons injectés à la racine (providedIn: 'root')
│   │   ├── guards/                      # AuthGuard, RoleGuard, VerifiedGuard
│   │   ├── interceptors/                # JwtInterceptor, ErrorInterceptor
│   │   └── services/
│   │       ├── local/                   # Services locaux (storage, network, device...)
│   │       │   ├── storage.service.ts
│   │       │   ├── network.service.ts
│   │       │   └── websocket.service.ts
│   │       │
│   │       └── api/                     # Services API organisés par domaine métier
│   │           │
│   │           ├── auth/
│   │           │   ├── auth.model.ts        # Interfaces : LoginDto, RegisterDto, TokenResponse, User...
│   │           │   ├── auth.api.service.ts  # Appels HTTP bruts vers /accounts
│   │           │   └── auth.store.ts        # État global auth (currentUser$, isLoggedIn$, login(), logout()...)
│   │           │
│   │           ├── catalogue/
│   │           │   ├── catalogue.model.ts   # Categorie, Materiau, OffrePublique...
│   │           │   ├── catalogue.api.service.ts
│   │           │   └── catalogue.store.ts
│   │           │
│   │           ├── devis/
│   │           │   ├── devis.model.ts       # CreateQuoteDto, QuoteResponse, OrderResponse, DeliveryResponse...
│   │           │   ├── devis.api.service.ts
│   │           │   └── devis.store.ts
│   │           │
│   │           ├── transport/
│   │           │   ├── transport.model.ts
│   │           │   ├── transport.api.service.ts
│   │           │   └── transport.store.ts
│   │           │
│   │           ├── materiaux/
│   │           │   ├── materiaux.model.ts   # Carriere, OffreFournisseur, ParametreDefinition...
│   │           │   ├── materiaux.api.service.ts
│   │           │   └── materiaux.store.ts
│   │           │
│   │           ├── wallet/
│   │           │   ├── wallet.model.ts      # WalletBalance, WalletTransaction, WithdrawalRequest...
│   │           │   ├── wallet.api.service.ts
│   │           │   └── wallet.store.ts
│   │           │
│   │           ├── engins/
│   │           │   ├── engins.model.ts
│   │           │   ├── engins.api.service.ts
│   │           │   └── engins.store.ts
│   │           │
│   │           ├── adresse/
│   │           │   ├── adresse.model.ts     # Pays, Departement, Commune, Arrondissement, Village
│   │           │   ├── adresse.api.service.ts
│   │           │   └── adresse.store.ts     # Cache local du référentiel géographique
│   │           │
│   │           └── partenariat/
│   │               ├── partenariat.model.ts
│   │               ├── partenariat.api.service.ts
│   │               └── partenariat.store.ts
│   │
│   ├── layout/                          # Squelettes de navigation (shells)
│   │   ├── auth-shell/
│   │   │   ├── auth-shell.component.ts  # Layout simple centré, pas de tabs (login, register, OTP)
│   │   │   └── auth-shell.routes.ts
│   │   │
│   │   └── dashboard-shell/
│   │       ├── dashboard-shell.component.ts  # Ion-tabs configurés selon le rôle actif
│   │       └── dashboard-shell.routes.ts
│   │
│   ├── features/
│   │   │
│   │   ├── auth/                        # Pages d'authentification (chargées via auth-shell)
│   │   │   ├── login/
│   │   │   │   ├── login.page.ts
│   │   │   │   └── login.page.html
│   │   │   ├── register/
│   │   │   │   ├── register.page.ts
│   │   │   │   └── register.page.html
│   │   │   └── verify-otp/
│   │   │       ├── verify-otp.page.ts
│   │   │       └── verify-otp.page.html
│   │   │
│   │   └── dashboard/                   # Toutes les pages post-login (chargées via dashboard-shell)
│   │       │
│   │       ├── client/                  # Pages réservées aux CLIENT
│   │       │   ├── home/
│   │       │   ├── catalogue/
│   │       │   ├── devis/
│   │       │   └── commandes/
│   │       │
│   │       ├── supplier/                # Pages réservées aux SUPPLIER
│   │       │   ├── dashboard/
│   │       │   ├── mes-carrieres/
│   │       │   └── mes-offres/
│   │       │
│   │       ├── transporter/             # Pages réservées aux TRANSPORTER
│   │       │   ├── dashboard/
│   │       │   ├── mes-courses/
│   │       │   └── mes-tarifs/
│   │       │
│   │       ├── shared/                  # Pages accessibles à plusieurs rôles
│   │       │   ├── wallet/
│   │       │   ├── profil/
│   │       │   └── engins/
│   │       │
│   │       └── admin/                   # Pages Admin uniquement
│   │           ├── utilisateurs/
│   │           ├── partenariats/
│   │           └── retraits/
│   │
├── environments/
│   ├── environment.ts                   # { apiUrl: 'http://localhost:8000/api/v1' }
│   └── environment.prod.ts              # { apiUrl: 'https://api.materiauxexpress.bj/api/v1' }
│
└── theme/
    └── variables.scss                   # Thème Ionic + imports Tailwind
```

---

## Pattern des fichiers dans `core/services/api/`

### 1. Le Model (`*.model.ts`)

Contient **toutes les interfaces TypeScript** du domaine : DTOs d'entrée, types de réponse, enums.

```typescript
// core/services/api/auth/auth.model.ts

export type UserRole = "CLIENT" | "SUPPLIER" | "TRANSPORTER" | "ADMIN" | "COLLABORATOR";

export interface User {
  public_id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  primary_role: UserRole;
  roles: UserRole[];
  is_active: boolean;
  is_validated: boolean;
  is_verified: boolean;
  is_hybrid: boolean;
  created_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
```

### 2. Le Service API (`*.api.service.ts`)

Contact **direct et brut** avec le backend. Aucune logique métier, aucun état.
Retourne uniquement des `Observable<T>`. Les composants ne l'appellent **jamais directement**.

```typescript
// core/services/api/auth/auth.api.service.ts
@Injectable({ providedIn: "root" })
export class AuthApiService {
  private readonly url = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  login(dto: LoginDto): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/login`, dto);
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.url}/register`, dto);
  }

  verifyOtp(dto: { otp_code: string }): Observable<User> {
    return this.http.post<User>(`${this.url}/verify-otp`, dto);
  }

  refreshToken(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/refresh`, { refresh_token: refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, { refresh_token: refreshToken });
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.url}/me`);
  }
}
```

### 3. Le Store (`*.store.ts`)

**Couche état** consommée par toute l'application via injection.
C'est la **seule porte d'entrée** vers les données pour les composants.

#### Règle de réactivité — Signals en priorité

Les **signals** sont la source de vérité principale pour les composants.
Les `BehaviorSubject` ne sont conservés que pour l'interopérabilité RxJS (pipe, combineLatest, etc.)
et doivent toujours rester **privés**.

```
Signal (writeable)   →  exposé en lecture via signal() ou computed()
BehaviorSubject      →  privé, jamais exposé directement aux composants
Observable           →  uniquement pour les flux RxJS internes (HTTP, interop)
```

#### Exemple canonique — `auth.store.ts`

```typescript
// core/services/api/auth/auth.store.ts
@Injectable({ providedIn: "root" })
export class AuthStore {
  // ── État interne ──────────────────────────────────────────────────
  // BehaviorSubject privé : uniquement pour l'interop RxJS (intercepteur JWT, etc.)
  private readonly _currentUser = new BehaviorSubject<User | null>(null);
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  // ── Signals publics (source de vérité pour les composants) ────────
  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal(false);

  // ── Computed signals (dérivés, recalculés automatiquement) ────────
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly primaryRole = computed(() => this.currentUser()?.primary_role ?? null);

  // ── Observables (interop RxJS pour les intercepteurs/guards) ──────
  readonly currentUser$ = this._currentUser.asObservable();
  readonly isLoggedIn$ = this._currentUser.pipe(map((u) => !!u));

  constructor(
    private authApi: AuthApiService,
    private storage: StorageService,
    private router: Router,
  ) {}

  // ── Actions ───────────────────────────────────────────────────────

  login(dto: LoginDto): Observable<void> {
    this._isLoading.next(true);
    this.isLoading.set(true);

    return this.authApi.login(dto).pipe(
      tap(async (res) => {
        await this.storage.setTokens(res.access_token, res.refresh_token);
        // Mettre à jour les DEUX sources pour cohérence RxJS + Signal
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

  async logout(): Promise<void> {
    const refreshToken = await this.storage.getRefreshToken();
    if (refreshToken) this.authApi.logout(refreshToken).subscribe();
    await this.storage.clearTokens();
    this._currentUser.next(null);
    this.currentUser.set(null);
    this.router.navigate(["/auth/login"]);
  }

  // Méthode utilitaire synchrone (pas besoin d'async/observable)
  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }
}
```

#### Consommation dans les composants

```typescript
// Dans un composant standalone — toujours injecter le STORE, jamais le api.service
export class HomePage {
  private authStore = inject(AuthStore);
  private devisStore = inject(DevisStore);

  // Lire les signals directement dans le template
  readonly user = this.authStore.currentUser; // Signal<User | null>
  readonly isAdmin = computed(() => this.authStore.hasRole("ADMIN"));
  readonly quotes = this.devisStore.myQuotes; // Signal<Quote[]>
  readonly loading = this.devisStore.isLoading; // Signal<boolean>
}
```

```html
<!-- Template : syntaxe signal (pas de async pipe nécessaire) -->
@if (user()) {
<p>Bonjour {{ user()!.full_name }}</p>
} @if (loading()) {
<ion-spinner />
} @else { @for (quote of quotes(); track quote.public_id) {
<app-devis-card [quote]="quote" />
} }
```

---

## Layout / Shells

### `auth-shell`

Layout minimaliste sans tabs ni menu. Pages : login, register, verify-otp.

```typescript
// layout/auth-shell/auth-shell.component.ts
@Component({
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class AuthShellComponent {}
```

### `dashboard-shell`

Layout avec `ion-tabs` dont la configuration est **dynamique selon le `primary_role`** de l'utilisateur.

```
CLIENT      → Tabs : Accueil | Catalogue | Devis | Commandes | Profil
SUPPLIER    → Tabs : Dashboard | Offres | Carrières | Wallet | Profil
TRANSPORTER → Tabs : Dashboard | Courses | Tarifs | Wallet | Profil
ADMIN       → Interface dédiée sans tabs standards
```

Un utilisateur `is_hybrid` (multi-rôles) peut **switcher de vue** via un sélecteur de rôle dans le header.

---

## Routing Global (`app.routes.ts`)

```typescript
export const routes: Routes = [
  {
    path: "auth",
    loadComponent: () => import("./layout/auth-shell/auth-shell.component"),
    children: [
      { path: "login", loadComponent: () => import("./features/auth/login/login.page") },
      { path: "register", loadComponent: () => import("./features/auth/register/register.page") },
      { path: "verify-otp", loadComponent: () => import("./features/auth/verify-otp/verify-otp.page") },
      { path: "", redirectTo: "login", pathMatch: "full" },
    ],
  },
  {
    path: "dashboard",
    loadComponent: () => import("./layout/dashboard-shell/dashboard-shell.component"),
    canActivate: [AuthGuard],
    children: [
      // Routes client, supplier, transporter, shared, admin...
    ],
  },
  { path: "", redirectTo: "auth/login", pathMatch: "full" },
];
```

---

## Authentification & Tokens

### Stockage — via `StorageService` (encapsule `@capacitor/preferences`)

```typescript
// Jamais localStorage — toujours Capacitor Preferences
await Preferences.set({ key: "access_token", value: token });
await Preferences.set({ key: "refresh_token", value: token });
```

### `JwtInterceptor`

- Lit le `access_token` depuis `StorageService`
- Injecte `Authorization: Bearer <token>` sur chaque requête sortante
- Sur réponse `401` → appelle `POST /accounts/refresh` automatiquement
- Si le refresh échoue → `authStore.logout()`

### `ErrorInterceptor`

- `422` → parse les erreurs Pydantic et les expose champ par champ
- `403` → toast "Accès non autorisé"
- `500` → toast "Erreur serveur, réessayez"
- `0` (réseau) → toast "Vérifiez votre connexion internet"

---

## Backend API

- **Base URL Dev** : `http://localhost:8000/api/v1`
- **Base URL Prod** : `https://api.materiauxexpress.bj/api/v1`
- **Auth** : `Authorization: Bearer <access_token>`
- **Format** : JSON exclusivement
- **Identifiant externe** : Toujours `public_id` (UUID) dans les URLs — jamais les IDs numériques

| Préfixe URL     | Store associé                       | Description                                      |
| --------------- | ----------------------------------- | ------------------------------------------------ |
| `/accounts`     | `AuthStore`                         | Inscription, login JWT, profils B2B, rôles       |
| `/adresses`     | `AdresseStore`                      | Découpage géographique Bénin (Pays → Village)    |
| `/materiaux`    | `CatalogueStore` + `MateriauxStore` | Catalogue, carrières, offres fournisseurs        |
| `/devis`        | `DevisStore`                        | Devis, commandes, livraisons, litiges, paiements |
| `/transport`    | `TransportStore`                    | Types camions, tarifs, courses de livraison      |
| `/wallet`       | `WalletStore`                       | Solde, transactions, retraits Mobile Money       |
| `/engins`       | `EnginsStore`                       | Catalogue engins BTP, demandes, contrats         |
| `/partenariats` | `PartenariatStore`                  | Formulaire acquisition leads B2B                 |

---

## Styles — Tailwind v4 + Ionic

- **Layout et espacements** → classes Tailwind (`flex`, `gap-*`, `p-*`, `rounded-*`, `grid`...)
- **Couleurs sémantiques** → variables CSS Ionic (`var(--ion-color-primary)`, `var(--ion-color-danger)`...)
- **Animations subtiles** → `transition-all`, `duration-200`, `ease-in-out`, `hover:scale-[1.02]`
- **Composants Ionic** → stylisés via CSS custom properties Ionic, pas de surcharge avec Tailwind
- Ne **jamais** mélanger binding `[style]` Angular et classes Tailwind sur le même élément

```html
<!-- ✅ Correct -->
<ion-card class="rounded-2xl shadow-md mx-4 mt-3 transition-shadow duration-200 hover:shadow-lg">
  <ion-card-content class="flex flex-col gap-3">
    <span class="text-sm text-gray-500">Prix total</span>
    <span class="text-2xl font-bold" style="color: var(--ion-color-primary)"> 141 250 FCFA </span>
  </ion-card-content>
</ion-card>
```

---

## Icônes — PrimeIcons

Utiliser **exclusivement PrimeIcons** (`pi pi-*`) pour toutes les icônes.

```html
<i class="pi pi-shopping-cart text-xl"></i>
<i class="pi pi-map-marker"></i>
<i class="pi pi-wallet"></i>
<i class="pi pi-truck"></i>
<i class="pi pi-check-circle text-green-500"></i>
<i class="pi pi-times-circle text-red-500"></i>
<i class="pi pi-spin pi-spinner"></i>
<!-- loading -->
```

---

## Logique Métier Critique

### Transport inclus vs exclu

```typescript
if (categorie.transport_inclus === true) {
  // Sable, gravier, agrégats → prix tout compris
  // Pas de calcul transport séparé dans le devis
} else {
  // Ciment, fer à béton → appeler POST /transport/calcul
  // pour lister et comparer les offres des transporteurs
}
```

### Statuts de commande (Order)

```
PENDING_PAYMENT
  → PAID_AWAITING_DISPATCH
    → DISPATCHED_TO_TRANSPORTER
      → IN_PROGRESS
        → PARTIALLY_DELIVERED
          → DELIVERED
↘ CANCELLED (possible à tout moment)
```

### Devis — expiration

Vérifier `is_expired` et `time_remaining_h` avant d'afficher le bouton "Commander".
Un devis expiré (`is_expired: true`) ne peut plus être confirmé en commande.

### Wallet — Statuts de retrait

```
DRAFT → PENDING_REVIEW → APPROVED → PROCESSING → COMPLETED
                       ↘ REJECTED  (solde remboursé automatiquement)
```

---

## Plugins Capacitor

| Plugin                          | Usage                                          |
| ------------------------------- | ---------------------------------------------- |
| `@capacitor/preferences`        | Stockage sécurisé tokens JWT                   |
| `@capacitor/geolocation`        | GPS pour adresse de livraison                  |
| `@capacitor/push-notifications` | Notifications push (courses, statuts commande) |
| `@capacitor/camera`             | Photos preuves de livraison                    |
| `@capacitor/network`            | Détection mode offline                         |
| `@capacitor/browser`            | Liens de paiement Moneroo / PayDunya           |

---

## Règles Absolues

1. **Jamais `localStorage`** — uniquement `@capacitor/preferences` via `StorageService`
2. **Les composants n'appellent jamais un `*.api.service.ts`** directement — toujours via le Store
3. **Signals en priorité pour la réactivité** — les composants lisent des `signal()` et `computed()`, pas des `Observable`. Les `BehaviorSubject` restent privés dans les stores, uniquement pour l'interop RxJS (intercepteurs, guards)
4. **Toujours typer** les réponses API — une interface TypeScript par réponse dans le `*.model.ts`
5. **Reactive Forms uniquement** — aucun template-driven form
6. **Lazy loading obligatoire** — `loadComponent` ou `loadChildren` sur toutes les features
7. **`public_id` dans les URLs** — jamais les IDs numériques internes
8. **Un seul rôle affiché à la fois** — l'utilisateur hybride switche via sélecteur de rôle
9. **Référentiel `/adresses` mis en cache** — stocker dans `AdresseStore` au premier appel
10. **Syntaxe template moderne** — utiliser `@if`, `@for`, `@switch` (Angular 17+), pas `*ngIf`/`*ngFor`
