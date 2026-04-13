# Documentation Technique de l'API - Module Devis & Commandes (Quotes & Orders)

Ce document décrit les points de terminaison (endpoints), les données échangées (requêtes & réponses), ainsi que le workflow global du backend concernant le cycle d'achat : création d'un devis simulé, validation en commande, logistique (transport), litiges et système de paiements tiers (Moneroo / PayDunya).

---

## Sommaire
1. [Workflow Global (Cycle de vie complet)](#1-workflow-global-cycle-de-vie-complet)
2. [Devis (Quotes)](#2-devis-quotes)
3. [Commandes (Orders)](#3-commandes-orders)
4. [Livraison partielle / Logistique](#4-livraison-partielle--logistique)
5. [Litiges (Disputes)](#5-litiges-disputes)
6. [Paiement (Webhooks Moneroo & Paydunya)](#6-paiement-webhooks-moneroo--paydunya)
7. [Administration & KPIs](#7-administration--kpis)

---

## 1. Workflow Global (Cycle de vie complet)

1. **Simulation (Devis) :** Le client (Client/Company) saisit sa demande via l'interface `/devis/creer`. L'API `POST /devis/` cherche le meilleur fournisseur à moins de 50 km, chiffre le transport (Google Maps) et fige un Devis (validité par défaut courte, ex: expirant sous quelques heures).
2. **Confirmation (Commande) :** Si le client valide le prix, le frontend appelle `POST /devis/{public_id}/confirm`. Le devis devient une Commande (`Order`). S'il paie maintenant, il initialise Moneroo ou PayDunya.
3. **Assignation (Transport) :** Selon la logique du système, un transporteur (Role: `TRANSPORTER`) peut voir la commande et l'accepter, ou elle lui est assignée par l'admin (`POST /devis/orders/{public_id}/assigner`).
4. **Logistique :** Le transporteur indique qu'il a chargé via `start-delivery`, puis fait potentiellement des livraisons partielles, puis marque la commande comme achevée (`confirm-delivery`). 
5. **Wallet / Versement :** A la confirmation de livraison, l'argent est réparti automatiquement (vers les portefeuilles du Fournisseur et du Transporteur) par le module financier sous-jacent.

> **Préfixe des Requêtes** : `/devis`

---

## 2. Devis (Quotes)

### Créer / Simuler un Devis (Client)
- **Requiert** : `Authorization: Bearer <Token_CLIENT>`
- **Méthode** : `POST /devis/`
- **Payload (`QuoteRequest`)** :
```json
{
  "product_id": 1,
  "quantity": 10.0,
  "delivery_address": "Lot 45, Quartier Aibatin, Cotonou",
  "delivery_datetime": "2026-04-10T08:00:00Z",
  "delivery_speed": "NORMAL"
}
```
*Note: `delivery_datetime` doit être dans minimum 24h. Les différents speeds sont "NORMAL", "RAPIDE" (supplément tarifaire), "ULTRA_RAPIDE".*

- **Réponse (201 Created)** : Renvoie un tableau de devis possibles avec tous les frais simulés.
```json
[
  {
    "public_id": "a-b-c-d",
    "product_name": "Sable lagunaire 0/5",
    "quantity": 10.0,
    "material_cost": 75000.0,
    "transport_cost": 30000.0,
    "total_price": 105000.0,
    "distance_info": {
      "distance_km": 15.2,
      "distance_simulated": false
    },
    "supplier_name": "Sogetrap Bénin",
    "status": "PENDING",
    "is_expired": false,
    "can_be_ordered": true
  }
]
```

### Autres endpoints Devis
- `GET /devis/` : Liste de l'historique des devis du compte.
- `GET /devis/{public_id}` : Lire un devis complet.
- `DELETE /devis/{public_id}` : Annuler un devis.

---

## 3. Commandes (Orders)

### Convertir le Devis en Commande
- **Méthode** : `POST /devis/{public_id}/confirm`
- **Réponse** : Retourne l'objet `OrderResponse` (qui contient un `order_number` alphanumérique pour le suivi) avec un statut `PENDING_PAYMENT`.

### Gérer la Commande (Transporteur / Admin)
- `POST /devis/orders/{public_id}/assigner` : Pour l'Admin, force l'association d'un transporteur.
- `POST /devis/orders/{public_id}/accept` : Le transporteur accepte la course (statut: `IN_PROGRESS`).
- `POST /devis/orders/{public_id}/start-delivery` : Le camion démarre la livraison.
- `POST /devis/orders/{public_id}/confirm-delivery` : Livré ! *Déclenche aussi au backend le transfert des fonds vers les Wallets respectifs.*

### Voir et clôturer les Commandes
- `GET /devis/orders/` : Adaptatif selon le rôle (l'admin voit tout, le client ses achats, le transporteur ses courses).
- `POST /devis/orders/{public_id}/close` : Marquer définitivement en `COMPLETED`.
- `GET /devis/orders/{public_id}/pdf` : (Téléchargement de fichier) Construit et retourne la facture/bon de commande au format A4 PDF !

---

## 4. Livraison partielle / Logistique
Pour gérer les gros volumes nécessitant de multiples tours de camion (les rotations).

### Ajouter un bond de livraison partiel
- **Requiert** : Transporteur associé.
- **Méthode** : `POST /devis/orders/{public_id}/partial-deliveries`
- **Payload (`PartialDeliveryCreate`)** :
```json
{
  "quantity_delivered": 5.0,
  "delivered_at": "2026-04-10T14:00:00Z",
  "transporter_id": "UUID-transporteur",
  "truck_id": "UUID-camion",
  "delivery_speed": "NORMAL"
}
```
*Si un client a commandé 20 tonnes de sables, le transporteur peut le faire en deux fois 10 tonnes en appellant cet endpoint.*

---

## 5. Litiges (Disputes)

Permet d'immobiliser les fonds en cas de problème à la livraison.

- `POST /devis/orders/{public_id}/dispute` : Ouvre un litige (Client, Company) avec `{"issue_description": "Manque de matériel..."}`.
- `GET /devis/disputes/` : Liste (Admin-only).
- `PATCH /devis/disputes/{dispute_id}/resolve` : L'Admin tranche, avec option de `refund_amount` (remboursement direct à venir).

---

## 6. Paiement (Webhooks Moneroo & Paydunya)

### Moneroo (Paiements Standards)
- `POST /devis/orders/{public_id}/payment/moneroo` : Initialise le paiement sécurisé depuis le client.
- `POST /devis/payment/webhook/moneroo` : Cible de callback que Moneroo interroge de lui-même. Vérifie et valide le paiement dans notre instance et passe la commande système en statut `PAID_AWAITING_DISPATCH`.

### Paydunya (Demande de Paiements par SMS/Push)
- `POST /devis/orders/{public_id}/payment/paydunya-push` : Pousse directement une invitation à payer sur le mobile de la cible.
- `POST /devis/payment/webhook/paydunya` : Callback Webhook.

---

## 7. Administration & KPIs

L'administrateur possède des endpoints propres de paramétrage :
- `POST /devis/admin/configurations` : Stocke des variables globales de l'app en string-clef paramètre (ex: prix essence global / kilométrage unitaire).
- `GET /devis/kpi/{partner_id}` : Récupère les métriques consolidées (score de litiges, nombre de livraisons) d'un transporteur ou fournisseur pour alimenter le tableau de bord de Modération SOGETRAP.
