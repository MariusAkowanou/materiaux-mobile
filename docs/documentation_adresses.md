# Documentation Technique de l'API - Module Adresses

Ce document décrit le référentiel géographique du backend de la plateforme, permettant un repérage fin et textuel des départements, communes et villages pour le système de livraison, ainsi que le carnet d'adresses personnel de l'utilisateur final.

---

## Sommaire
1. [Workflow Global (UI / Frontend)](#1-workflow-global-ui--frontend)
2. [Hiérarchie Géographique (Référentiel)](#2-hiérarchie-géographique-référentiel)
3. [Carnet d'Adresses Clients](#3-carnet-dadresses-clients)

---

## 1. Workflow Global (UI / Frontend)

Le module d'adresses sert 2 objectifs :
1. **Remplir les formulaires (Admin / Fournisseurs) :** Lors de la création de la fiche d'une Carrière (Module Matériaux), le fournisseur peut assigner celle-ci à un `village_id` précis. Ce découpage assure qu'en base, on puisse lister toutes les carrières par Région.
2. **Carnet Privé (Client) :** Lors d'une commande (QuoteRequest), au lieu de retaper manuellement les adresses Google, le client peut sélectionner une entrée stockée en amont dans son carnet (`/mes-adresses`).

> **Préfixe des Requêtes** : `/adresse`

---

## 2. Hiérarchie Géographique (Référentiel)

La structure au Bénin (ou ailleurs) suit exactement cet embranchement : 
**PAYS → DÉPARTEMENTS → COMMUNES → ARRONDISSEMENTS → VILLAGES**.

Tous ces endpoints de type `GET` sont publics (aucune auth requise). Les actions de Modification/Création nécessitent un `Bearer` avec le rôle `ADMIN`.

### Navigation Descendante (Cascading Selects)

*   `GET /adresse/pays` : Récupérer les ID des pays (ex: Bénin).
*   `GET /adresse/pays/{pays_id}/departements` : Ex : Obtenir Littoral, Atlantique.
*   `GET /adresse/departements/{dept_id}/communes`
*   `GET /adresse/communes/{commune_id}/arrondissements`
*   `GET /adresse/arrondissements/{arr_id}/villages`

> **Note Performance :** Pour récupérer tout d'un coup, il est possible d'appeler `GET /adresse/pays/{pays_id}`. Cet endpoint retourne expressément la hiérarchie imbriquée en intégralité (`PaysComplet`). A utiliser avec parcimonie côté frontend pour la mise en cache.

---

## 3. Carnet d'Adresses Clients

Chaque utilisateur `CLIENT` ou `COMPANY` peut sauvegarder une adresse favorite.

### Endpoints
- **Méthode** : `POST /adresse/mes-adresses`
- **Requiert** : Auth Bearer
- **Exemple de Payload (`ClientAddressCreate`)** :
```json
{
  "formatted_address": "Haie Vive Lot 42, Cotonou, Bénin",
  "name": "Bureau Sogetrap",
  "lat": 6.35,
  "lng": 2.42
}
```
- **Méthode (Lecture)** : `GET /adresse/mes-adresses` (Retourne simplement la liste associée au `current_user.id`).
- **Méthode (Suppression)** : `DELETE /adresse/mes-adresses/{addr_id}`
