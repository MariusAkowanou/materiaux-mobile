# Documentation Technique de l'API - Module Transport & Logistique

Ce document décrit les points de terminaison (endpoints), les données échangées et le workflow de la flotte de camions, de la tarification des véhicules, de la gestion des courses et du suivi de localisation GPS utilisé par le backend de Matériaux Express.

---

## Sommaire
1. [Workflow Global (Frontend)](#1-workflow-global-frontend)
2. [Profils des Transporteurs](#2-profils-des-transporteurs)
3. [Référentiel des Camions & Flotte](#3-référentiel-des-camions--flotte)
4. [Gestion de la Tarification](#4-gestion-de-la-tarification)
5. [Processus des Courses (Courses Transport)](#5-processus-des-courses-courses-transport)
6. [API de Calcul et Tracking GPS](#6-api-de-calcul-et-tracking-gps)

---

## 1. Workflow Global (Frontend)

Ce module permet aux livreurs/transporteurs (`TRANSPORTER`) d'utiliser la plateforme pour monétiser leur flotte.
1. **Création Profil** : Le transporteur met à jour sa fiche d'entreprise (`POST /transport/profil`).
2. **Construction de sa flotte & tarifs** : Le transporteur fixe ses règles de paiement (au forfait / au km) via `POST /transport/tarifs` associés à des types de camions globaux définis par l'administrateur.
3. **Le Module Devis interroge le Transport** : Quand un client fait une demande de volume sur la plateforme, le module Devis envoie un appel interne via `POST /transport/calcul` pour obtenir la liste des transporteurs triés par coûts.
4. **Acception et Livraison** : Une fois la commande finalisée côté Devis, une "Course" est assignée à un transporteur. Son statut évoluera (`EN_ATTENTE`, `ASSIGNEE`, `EN_COURS`, `LIVREE`).

> **Préfixe des Requêtes** : `/transport`

---

## 2. Profils des Transporteurs

Permet à l'utilisateur `TRANSPORTER` de configurer ses zones d'interventions légales ou logistiques.

- `POST /transport/profil` : Création du profil de l'entreprise de livraison.
- `GET /transport/profil` : Récupère les données existantes.

**Payload (`TransporteurProfilCreate`) :**
```json
{
  "nom_entreprise": "Transports Rapides Bj",
  "zones_intervention": "Cotonou, Abomey-Calavi, Ouidah",
  "description": "Spécialiste livraison matériaux de construction"
}
```

---

## 3. Référentiel des Camions & Flotte

Avant de définir ses prix, un transporteur a besoin que les instances de "Types de camions" existent pour être choisies. Ceci relève de l'administrateur.

### Voir le catalogue de camions (Public / Liste)
- **Méthode** : `GET /transport/camions`  
- **Réponse** : 
```json
[
  {
    "id": 1,
    "libelle": "Camion 6 roues (Benne)",
    "capacite_m3": 7.0,
    "charge_utile_tonne": 10.0,
    "description": "Benne basculante 6 roues",
    "est_actif": true,
    "ordre": 1
  }
]
```

L'administrateur peut faire un `POST`, `PATCH` sur l'ID de ces camions.

---

## 4. Gestion de la Tarification

C'est ici que l'intelligence du transport opère. Sur la plateforme, un transporteur va déclarer ses prix selon 2 modes : 
- **Le forfait de voyage** : Un prix brut pour un tour de camion, peu importe la distance.
- **La distance au kilomètre** : Un prix fixé unitairement multiplié par le nombre de `km` du module Carte, multiplié par le `nb_voyages`.

### Déclarer ses Tarifs par Camion (Transporteur)
- **Requiert** : `Authorization: Bearer <Token_TRANSPORTER>`
- **Méthode** : `POST /transport/tarifs`
- **Payload** :
```json
{
  "camion_type_id": 1,
  "mode_tarif": "km",    // "km" ou "voyage"
  "prix": 750.00         // Soit 750F par km soit 750F forfaitaire
}
```
*Note*: Modification & suppression de ces grilles gérées respectivement sur `PATCH /tarifs/{id}` et `DELETE /tarifs/{id}`.

---

## 5. Processus des Courses (Courses Transport)

Cet espace permet au Transporteur de vérifier l'état de ses feuilles de route générées automatiquement par le paiement des devis.

### Voir ses missions de transport
- **Méthode** : `GET /transport/courses/mes`
- **Réponse** : Renvoie les détails complets (ID commmande, points de chute, distances calculées) et le **statut**.

### Actions autorisées sur une route
- `POST /transport/courses/{course_id}/assigner` : Pour un transporteur généraliste doté de sous-profils, permet potentiellement de repasser l'action, etc. (En mode multi-roles, ceci peut être fait par l'admin).
- `PATCH /transport/courses/{course_id}/statut` : Transitionner l'étape des livraisons. Les statuts attendus sont : `EN_ATTENTE → ASSIGNEE → EN_COURS → LIVREE`.

---

## 6. API de Calcul et Tracking GPS

Les Endpoints de bas niveau appelés par le backend ou les Frontends PWA Live.

### Simuler la course et comparer tous les livreurs
- **Méthode** : `POST /transport/calcul`
- **Exemple requête** :
```json
{
  "camion_type_id": 1,
  "nb_voyages": 2,
  "lat_depart": 6.3803,
  "lng_depart": 2.2234,
  "lat_arrivee": 6.4200,
  "lng_arrivee": 2.3850
}
```
**Réponse** : Une liste (`CalculTransportResult`) triée (le transporteur le moins cher et le plus rapide en premier) calculée **à la volée** selon "Distance GPS Haversine × Tarif du transporteur". Le module Devis prend le premier pour le client selon ses critères.

### Visualisation Mobile / Fleet Tracking
- **Méthode** : `GET /transport/courses/{course_id}/location`
- **Description** : Retourne la dernière trace télémétrique (latitude, longitude, cap directionnel) stockée en cache rapide ou base de données. Idéal pour l'UI client "Suivre mon camion en temps-réel".
- **Format attrapé** :
```json
{
  "course_id": 56,
  "lat": 6.40245,
  "lng": 2.32115,
  "heading": 124.0
}
```
