# Documentation Technique de l'API - Module Engins & Équipements

Ce document décrit la structure de l'API permettant aux fournisseurs ou transporteurs de mettre leurs machines lourdes (pelleteuses, grues, chargeuses, etc.) en location ou en vente sur Matériaux Express, et aux clients de les solliciter.

---

## Sommaire
1. [Workflow Global](#1-workflow-global)
2. [Catalogue (Machines et Catégories)](#2-catalogue-machines-et-catégories)
3. [Requêtes (Locations & Achats)](#3-requêtes-locations--achats)
4. [Contrats & Paiements](#4-contrats--paiements)

---

## 1. Workflow Global

1. **L'Admin** crée les `Catégories` (ex: "Terrassement", "Levage").
2. **Le Partenaire (Fournisseur/Transporteur)** publie sa flotte de `Machines` dans ces catégories en y associant des prix jour (Location) et/ou globaux (Achat).
3. **Le Client** explore le catalogue et envoie une `MachineRequest` (Demande de location ou d'achat).
4. **Le Partenaire / L'Admin** étudie la demande (ex: pour confirmer la disponibilité des dates), et l'approuve `(_approve_request)`. Cela génère un **Contrat** chiffré (`MachineContract`).
5. **Le Client** paie ce contrat via Moneroo/PayDunya.

> **Préfixe des Requêtes** : `/engins`

---

## 2. Catalogue (Machines et Catégories)

### Voir les catégories
- **Endpoint** : `GET /engins/categories`

### Lister toutes les machines disponibles
- **Endpoint** : `GET /engins/` (Possibilité de filtrer par `?category_id=UUID` ou `?mode=LOCATION` / `ACHAT`)

### Mettre une machine en ligne (Partenaires)
- **Endpoint** : `POST /engins/`
- **Exemple Payload (`MachineCreate`)** :
```json
{
  "name": "Caterpillar 320",
  "category_id": "550e8400-e29b-41d4-a716-446655440001",
  "mode": "LOCATION", 
  "description": "Excavatrice 20 tonnes, parfaite pour terrassement",
  "primary_image_url": "https://example.com/cat320.jpg",
  "specs": {"puissance": "150 ch", "poids_tonne": 20},
  "rent_price_day": 150000.0,
  "manufacturing_year": 2018,
  "location": "Cotonou",
  "with_operator": true,
  "transport_included": false
}
```
*Notes sur `mode` : Les valeurs attendues en base sont "LOCATION", "ACHAT", ou "BOTH" (les deux).*

---

## 3. Requêtes (Locations & Achats)

Une fois qu'un client repère un engin, il n'achète pas instantanément la machine. Il envoie un formulaire d'intention.

### Lancer une demande client
- **Endpoint** : `POST /engins/requests`
- **Payload (`MachineRequestCreate`)** :
```json
{
  "machine_id": "550e8400-e29b-41d4-a716-446655440010",
  "request_type": "LOCATION",
  "message": "J'ai besoin de cet engin 3 jours consécutifs avec un opérateur.",
  "start_date": "2026-04-10T08:00:00Z",
  "end_date": "2026-04-13T18:00:00Z",
  "with_operator_requested": true,
  "delivery_location": "Chantier Lot 45, Cotonou"
}
```

### Accepter ou rejeter (Partenaires/Admin)
- `POST /engins/requests/{req_id}/approve` -> Payload demandant le `total_price` et le `deposit_amount` (Acompte potentiel). **Ceci génère le CONTRAT.**
- `POST /engins/requests/{req_id}/reject` -> Ferme le ticket de l'engin.

---

## 4. Contrats & Paiements

Après approbation d'une "MachineRequest", un objet `Contract` en attente de fonds est créé pour le client.

- `GET /engins/contracts` : Liste les contrats du client en attente de paiement.
- `POST /engins/contracts/{contract_id}/payment/moneroo` : Déclenche l'intégration Moneroo ou valide la confirmation front.
- `POST /engins/contracts/{contract_id}/payment/paydunya-push` : Pousse le paiement sur le USSD du client.
