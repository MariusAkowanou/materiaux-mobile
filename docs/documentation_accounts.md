# Documentation Technique de l'API - Module Accounts (Authentification et Utilisateurs)

Ce document décrit les points de terminaison (endpoints), les données échangées (requêtes & réponses) ainsi que le workflow global à suivre par le frontend pour implémenter l'authentification et la gestion des utilisateurs.

---

## Sommaire
1. [Workflow Global (Frontend)](#1-workflow-global-frontend)
2. [Endpoints Publics et Authentification](#2-endpoints-publics-et-authentification)
3. [Profil Utilisateur Courant (`/me`)](#3-profil-utilisateur-courant-me)
4. [Gestion Multi-Rôles](#4-gestion-multi-rôles)
5. [Profils Métier (Fournisseur & Transporteur)](#5-profils-métier-fournisseur--transporteur)
6. [Administration (Admin)](#6-administration-admin)
7. [Endpoints Publiques Fournisseurs](#7-endpoints-publiques-fournisseurs)

---

## 1. Workflow Global (Frontend)

1. **Inscription Standard (Client, Company, Supplier, Transporter)**
   - Le frontend appelle l'un des endpoints de `/register/*` selon le type d'utilisateur.
   - Le backend crée le compte en base, associe le rôle, crée éventuellement un profil vide métier (ex: SupplierProfile ou TransporterProfile).
   - Un email contenant un code OTP est envoyé et le backend génère déjà des tokens JWT `access_token` et `refresh_token` dans la réponse.
   - L'utilisateur est connecté (token stocké par le frontend), mais le compte possède un boolean `is_validated=False` et `is_active=False`.

2. **Validation OTP (Obligatoire)**
   - L'interface redirige obligatoirement l'utilisateur vers un écran `/auth/verify-otp`.
   - L'utilisateur saisit son code à 6 chiffres.
   - L'application envoie ce code sur `/verify-otp`. 
   - Le backend passe l'utilisateur en `is_validated=True`. L'utilisateur accède alors au Dashboard complet.

3. **Connexion Classique**
   - L'utilisateur non connecté va sur la page login.
   - Soumission de l'email et mot de passe à `/login`.
   - Réception d'un `access_token` et `refresh_token` (valable 30j par défaut).
   - Si les informations sont valides mais que le back renvoie une erreur 403 à cause de `is_validated=False`, le frontend doit rediriger l'utilisateur vers la page de vérification OTP.

4. **Rafraîchissement des jetons**
   - À expiration de `access_token` (ou appel en erreur **401**), le frontend appelle `/refresh` avec le fameux `refresh_token`.
   - Mise à jour silencieuse de la session utilisateur.

---

## 2. Endpoints Publics et Authentification

Tous ces endpoints sont rattachés au préfixe : `/accounts` *(selon le root indexé, ici on l'assume sur préfixe router)*

### Inscription Rapide avec OTP et Token
Méthode : `POST /register/{type}` (Où `{type}` peut être `client`, `company`, `supplier`, `transporter`)
Permet de s'inscrire en bénéficiant automatiquement d'un email OTP.

**Exemple d'envoi pour `/register/supplier` :**
```json
{
  "email": "fournisseur@sogetrap.com",
  "phone": "+22990123456",
  "password": "MonSecret18!",
  "first_name": "Marc",
  "last_name": "Dossou",
  "company_name": "Dossou Granulats",
  "ifu_number": "32019...",
  "rccm_number": "RB/COT/19A...",
  "depot_address": "Route de Pahou",
  "latitude": 6.38,
  "longitude": 2.21,
  "site_type": "CARRIERE"
}
```

**Réponse (201 Created) :**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "u43j_...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "public_id": "a1b2...",
    "email": "fournisseur@sogetrap.com",
    "primary_role": "SUPPLIER",
    "roles": ["SUPPLIER"],
    "is_active": false,
    "is_validated": false
  }
}
```

### Connexion
Méthode : `POST /login`

**Données envoyées :**
```json
{
  "email": "jean@exemple.com",
  "password": "Mypassword123!"
}
```
**Réponse (200 OK) :** Semblable au profil de l'inscription (avec tokens).

### Validation de l'OTP
Méthode : `POST /verify-otp` (Un jeton valide doit être passé dans le header `Authorization : Bearer {access_token}`)

**Données envoyées :**
```json
{
  "otp_code": "123456"
}
```
**Réponse (200 OK) :** Retourne l'objet User avec `is_validated=true`.

### Renvoyer l'OTP
Méthode : `POST /resend-otp` (Header `Authorization` requis)
Renvoie un nouveau code OTP sur l'email/téléphone de l'utilisateur.

---

## 3. Profil Utilisateur Courant (`/me`)

S'assure de récupérer et modifier les données du compte lui-même. 
**Header `Authorization: Bearer Token` requis.**

### Obtenir les détails
- **Méthode** : `GET /me`
- **Réponse (200 OK)** : Objet `UserResponse` complet incluant le profil hybride (ex: documents IFU/Identité associés, compte entreprise, etc.).

### Mettre à jour le compte
- **Méthode** : `PATCH /me`
- **Payload** : `{"first_name": "Jean", "phone": "+2290000000"}`

---

## 4. Gestion Multi-Rôles

### Demander ou Ajouter un rôle à soi-même
- **Méthode** : `POST /me/roles`
- **Payload** : 
```json
{
  "role": "TRANSPORTER",
  "note": "Je dispose de 5 camions à mettre sur la plateforme"
}
```
- **Réponse** : Le backend crée automatiquement le profil (`TransporterProfile`) et attache le rôle.

### Retirer un rôle de soi-même
- **Méthode** : `DELETE /me/roles/{role}` (ex: `/me/roles/TRANSPORTER`)

### Obtenir l'historique de ses rôles
- **Méthode** : `GET /me/roles`
- **Réponse** : Liste des `RoleAssignmentResponse` indiquant qui a octroyé les rôles à quelle date.

---

## 5. Profils Métier (Fournisseur & Transporteur)

### Profil Fournisseur
- `GET /me/supplier-profile` : Affiche les informations de carrière/dépôt du fournisseur connecté.
- `POST /me/supplier-profile` : Création du profil si inexistant (souvent fait de force lors de l'attribution du rôle SUPPLIER).

### Profil Transporteur
- `GET /me/transporter-profile` : Affiche les informations légales et opérationnelles du transporteur.
- `POST /me/transporter-profile`.

### Gestion des Camions (Trucks)
- `POST /me/trucks`
**Exemple :**
```json
{
  "license_plate": "AF-1981-RB",
  "brand": "Renault",
  "max_weight": 20.0
}
```
- `GET /me/trucks` : Retourne la flotte (liste) des camions du compte.

---

## 6. Administration (Admin)

Ces routes nécessitent que le `current_user` ait le rôle actif `ADMIN`.

- `GET /` : Liste de tous les utilisateurs (Paginable: `?skip=0&limit=50&role=SUPPLIER`)
- `PATCH /{public_id}` : Activer/Suspendre un utilisateur.
  *Payload*: `{"account_status": "SUSPENDED"}`
- `POST /{public_id}/supplier-profile/validate` : L'admin vérifie les documents et valide le fournisseur (`is_validated = true` dans le modèle Profile, différent de l'OTP).
- `POST /{public_id}/transporter-profile/validate` : Identique pour les transporteurs.
- `POST /trucks/{truck_id}/validate` : Validation unitaire d'un camion en base de données.
- `POST /{public_id}/roles` et `DELETE /{public_id}/roles/{role}` pour octroyer manuellement un métier à un utilisateur.

---

## 7. Endpoints Publiques Fournisseurs

Routes ouvertes au public pour créer des affichages de type "Annuaire" ou tri géographique avant même de s'inscrire ou de se connecter.

### Liste globale
- `GET /suppliers?material=ciment&city=cotonou&skip=0&limit=10`
Retourne une liste publique des `SupplierProfileResponse`.

### Liste de proximité (Recherche Géolocalisée)
- `GET /suppliers/nearby?lat=6.36&lng=2.43&radius_km=50&material=sable`
**Réponse (200 OK) :** Transforme les données et les trie par calcul de "Haversine" de la plus proche à la plus lointaine carrière/usine.

```json
[
  {
    "id": "e2...",
    "company_name": "Carrière d'Atchoukpa",
    "latitude": 6.45,
    "longitude": 2.65,
    "distance_km": 12.35,
    "materials_available": ["sable"],
    "is_validated": true
  }
]
``` 
---

*Généré automatiquement suite à validation du workflow OTP, des structures métiers multi-rôles et de gestion de flotte logistique.*
