# Documentation Technique de l'API - Module Wallet & Commissions

Ce document décrit le fonctionnement du portefeuille virtuel intégré à Matériaux Express. Il permet de gérer la distribution des gains aux partenaires (Fournisseurs et Transporteurs) et leur permet de demander le virement ou retrait de leurs soldes.

---

## Sommaire
1. [Workflow Global (Financier)](#1-workflow-global-financier)
2. [Solde et Transactions (Partenaires)](#2-solde-et-transactions-partenaires)
3. [Demandes de Retrait (Payouts)](#3-demandes-de-retrait-payouts)
4. [Modération Administrative](#4-modération-administrative)

---

## 1. Workflow Global (Financier)

Le système financier de la plateforme est agnostique côté Frontend, mais fonctionne ainsi côté Backend :
1. Lorsqu'une commande est marquée comme `Livrée` par le transporteur *(endpoint de confirmation de livraison du module Devis)*.
2. Le système calcule la part revenant au fournisseur (Prix du Matériau * Quantité) et la part du transporteur (Prix Transport * Quantité), en enlevant la potentielle commission de la plateforme.
3. Ces gains sont versés sous forme de `Transactions` positives (**CREDIT**) vers le **Wallet** du partenaire.
4. Depuis son Dashboard, le partenaire consulte son solde et lance une demande de **Retrait** (Withdrawal).
5. L'administrateur ou le système webhook (ex: Moneroo Payout) approuve la transaction, générant un mouvement de type **DEBIT** sur le wallet du partenaire et son statut de paiement passe à l'état `APPROVED`.

> **Préfixe des Requêtes** : `/wallet`

---

## 2. Solde et Transactions (Partenaires)

### Voir son compte
- **Requiert** : `Authorization: Bearer <Token>` (Fournisseur ou Transporteur)
- **Méthode** : `GET /wallet/balance`
- **Réponse (200 OK)** : Retourne le solde actuel total ainsi qu'une liste détaillée des 10 à 20 dernières transactions pour la construction d'un "Relevé de compte".

```json
{
  "user_id": "uuid-du-partenaire",
  "balance": 150000.0,
  "recent_transactions": [
    {
      "id": "trans-uuid",
      "user_id": "uuid-du-partenaire",
      "amount": 75000.0,
      "transaction_type": "CREDIT",
      "description": "Paiement pour commande CMD-2026-XYZ",
      "reference_id": "CMD-2026-XYZ",
      "created_at": "2026-04-10T15:30:00Z"
    }
  ]
}
```

---

## 3. Demandes de Retrait (Payouts)

Pour retirer de l'argent vers un compte physique bancaire ou Mobile Money.

### Réaliser une demande
- **Méthode** : `POST /wallet/withdrawals`
- **Payload (`WithdrawalCreate`)** :
```json
{
  "amount": 50000.0,
  "payment_method": "MOBILE_MONEY_MTN",
  "payment_details": "+22990000000"
}
```
*Note : Le `amount` doit être inférieur ou égal au `balance` du compte (strictement positif), le backend lèvera une exception `400` sinon.*

### Voir ses propres demandes de retraits
- **Méthode** : `GET /wallet/withdrawals`
- **Réponse** : Liste des requêtes de retrait, leur montant, leur cible (ex: Mobile Money) et l'avancement temporel `status` (ex: `PENDING`, `APPROVED`, `REJECTED`).

---

## 4. Modération Administrative

L'administration vérifie et débloque concrètement l'argent.

### Lister toutes les requêtes en attente
- **Requiert** : `ADMIN`
- **Méthode** : `GET /wallet/admin/withdrawals?status=PENDING`

### Approuver ou Rejeter (Rembourser)
- **Méthode** : `POST /wallet/admin/withdrawals/{req_id}/review`
- **Payload (`WithdrawalReview`)** :
```json
{
  "status": "APPROVED",
  "admin_note": "Virement effectué via plateforme externe le 11/04."
}
```
*Architecture : Si le retrait est validé `APPROVED`, rien ne change puisque l'argent a déjà été pré-débité du solde à la création de la requête par sécurité. En revanche, si l'admin soumet `REJECTED`, le backend rembourse alors l'intégralité des fonds (`amount`) par une transaction inverse `CREDIT` cachée dans le Wallet du partenaire.*
