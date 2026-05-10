# Documentation Frontend — Réseau Transporteurs (CAS 3)

> **Contexte :** Quand un client confirme un devis dont le fournisseur ne livre pas lui-même, la commande est diffusée simultanément à tous les transporteurs inscrits au réseau de la carrière. Le premier qui accepte est assigné.

---

## Sommaire

1. [Acteurs & rôles](#1-acteurs--rôles)
2. [Flux global](#2-flux-global)
3. [WebSocket — événements reçus](#3-websocket--événements-reçus)
4. [Endpoints REST — Transporteur](#4-endpoints-rest--transporteur)
5. [Endpoints REST — Admin / Fournisseur](#5-endpoints-rest--admin--fournisseur)
6. [Statuts de commande](#6-statuts-de-commande)
7. [Exemples de payloads](#7-exemples-de-payloads)
8. [Schéma d'écrans suggérés](#8-schéma-décrans-suggérés)

---

## 1. Acteurs & rôles

| Acteur | Rôle |
|---|---|
| **Client** | Confirme le devis → déclenche la notification réseau |
| **Transporteur** | Reçoit la notif WS, accepte la course, démarre la livraison |
| **Fournisseur / Admin** | Voit la liste des transporteurs d'un réseau, est notifié quand la course est acceptée |

---

## 2. Flux global

```
[Client confirme devis]
        │
        ▼
   Order créée (status = CONFIRMED)
        │
        ▼
   Notification WS → tous les transporteurs du réseau de la carrière
        │  type: "NEW_ORDER_AVAILABLE"
        │
   ┌────┴────┐
   │         │
   T1        T2    ← plusieurs transporteurs reçoivent en même temps
   │
   [Accepte en premier]  POST /transport/orders/{order_id}/accepter
        │
        ▼
   Order status = ASSIGNED
   T2 reçoit  WS { type: "ORDER_TAKEN" }   ← (côté UX : griser le bouton)
   Client + Fournisseur reçoivent WS { type: "ORDER_ACCEPTED" }
        │
   [Transporteur part]  PATCH /transport/orders/{order_id}/en-route
        │
        ▼
   Order status = IN_PROGRESS
   Client reçoit WS { type: "ORDER_EN_ROUTE" }
        │
   [GPS en temps réel via WS]
        │
        ▼
   Order status = DELIVERED  (endpoint existant)
```

---

## 3. WebSocket — événements reçus

### Connexion

```
ws://api/api/v1/ws?token=<JWT>
```

Chaque utilisateur connecté reçoit uniquement les messages qui lui sont destinés.

---

### 3.1 `NEW_ORDER_AVAILABLE` — reçu par le Transporteur

Déclenché dès qu'une commande CAS 3 est créée depuis la carrière de son réseau.

```json
{
  "type": "NEW_ORDER_AVAILABLE",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "ORD-20260505-0042",
  "carriere_id": 7,
  "delivery_address": "Quartier Gbégamey, Cotonou",
  "distance_km": 12.4,
  "quantity": 25.0
}
```

**Action UX :**
- Afficher une notification push / bannière
- Bouton **"Accepter la course"** (timer suggéré : 2 min avant expiration visuelle)
- Appeler `POST /transport/orders/{order_id}/accepter`

---

### 3.2 `ORDER_ACCEPTED` — reçu par Client & Fournisseur

```json
{
  "type": "ORDER_ACCEPTED",
  "order_number": "ORD-20260505-0042",
  "transporteur": "Transports Rapides Bj"
}
```

**Action UX :**
- Afficher "Votre commande a été prise en charge par *Transports Rapides Bj*"
- Mettre à jour le badge de statut : `CONFIRMED → ASSIGNED`

---

### 3.3 `ORDER_EN_ROUTE` — reçu par le Client

```json
{
  "type": "ORDER_EN_ROUTE",
  "order_number": "ORD-20260505-0042",
  "message": "Votre commande est en route !"
}
```

**Action UX :**
- Notification push + son
- Afficher le suivi GPS (appeler `GET /transport/courses/{course_id}/location` en polling ou WS)
- Mettre à jour le badge : `ASSIGNED → IN_PROGRESS`

---

## 4. Endpoints REST — Transporteur

Base URL : `/api/v1/transport`  
Authentification : `Authorization: Bearer <JWT>` requis sur tous les endpoints.

---

### 4.1 Créer son profil transporteur (pré-requis)

```
POST /api/v1/transport/profil
```

```json
{
  "nom_entreprise": "Transports Rapides Bj",
  "zones_intervention": "Cotonou, Abomey-Calavi",
  "description": "Spécialiste livraison matériaux de construction"
}
```

**Réponse 201 :**
```json
{
  "id": 3,
  "user_id": "...",
  "nom_entreprise": "Transports Rapides Bj",
  "est_verifie": false,
  "est_disponible": true
}
```

> ⚠️ Le profil doit exister avant de rejoindre un réseau.

---

### 4.2 Rejoindre le réseau d'une carrière

```
POST /api/v1/transport/reseau/{carriere_id}/rejoindre
```

Pas de body requis.

**Réponse 201 :**
```json
{
  "carriere_id": 7,
  "transporteur_id": 3,
  "est_actif": true
}
```

> Idempotent : si déjà membre, réactive simplement le lien.

---

### 4.3 Quitter un réseau

```
DELETE /api/v1/transport/reseau/{carriere_id}/quitter
```

**Réponse 204** (pas de body)

---

### 4.4 Mes réseaux (carrières dont je fais partie)

```
GET /api/v1/transport/reseau/mes-carrieres
```

**Réponse 200 :**
```json
[
  { "carriere_id": 7, "est_actif": true },
  { "carriere_id": 12, "est_actif": true }
]
```

---

### 4.5 Accepter une commande ⭐

```
POST /api/v1/transport/orders/{order_id}/accepter
```

`order_id` = UUID reçu dans l'événement WS `NEW_ORDER_AVAILABLE`.

**Réponse 200 (succès — premier arrivé) :**
```json
{
  "message": "Commande acceptée avec succès",
  "order_number": "ORD-20260505-0042",
  "status": "ASSIGNED"
}
```

**Réponse 409 (trop tard) :**
```json
{ "detail": "Cette commande a déjà été acceptée par un autre transporteur" }
```

**Réponse 400 (indisponible) :**
```json
{ "detail": "Vous êtes marqué indisponible" }
```

> 💡 Après un 409, le frontend doit griser le bouton et afficher "Course déjà prise".

---

### 4.6 Démarrer la livraison (En route) ⭐

```
PATCH /api/v1/transport/orders/{order_id}/en-route
```

Pas de body requis.

**Réponse 200 :**
```json
{
  "order_number": "ORD-20260505-0042",
  "status": "IN_PROGRESS"
}
```

**Erreurs possibles :**
- `403` : vous n'êtes pas le transporteur assigné
- `400` : statut actuel n'est pas `ASSIGNED`

---

### 4.7 Mes courses

```
GET /api/v1/transport/courses/mes
```

**Réponse 200 :** liste de `CourseTransportResponse`

```json
[
  {
    "id": 14,
    "transporteur_id": 3,
    "order_id": "550e8400-...",
    "camion_type_id": 2,
    "camion_libelle": "Camion 6 roues (Benne)",
    "nb_voyages": 2,
    "distance_km": "12.40",
    "prix_unitaire_transport": "7500.00",
    "cout_transport_total": "15000.00",
    "statut": "en_cours"
  }
]
```

---

### 4.8 Mettre à jour sa disponibilité

```
PATCH /api/v1/transport/profil
```

```json
{ "est_disponible": false }
```

> Quand `est_disponible = false`, le transporteur ne reçoit plus les nouvelles notifications de course.

---

## 5. Endpoints REST — Admin / Fournisseur

### 5.1 Liste des transporteurs d'un réseau

```
GET /api/v1/transport/reseau/{carriere_id}/transporteurs
```

**Réponse 200 :**
```json
[
  {
    "transporteur_id": 3,
    "user_id": "...",
    "nom_entreprise": "Transports Rapides Bj",
    "est_disponible": true,
    "est_verifie": true
  }
]
```

---

## 6. Statuts de commande

| Statut | Signification | Affiché côté |
|---|---|---|
| `CONFIRMED` | En attente d'un transporteur | Client + Transporteurs |
| `ASSIGNED` | Transporteur assigné, pas encore parti | Client + Transporteur assigné |
| `IN_PROGRESS` | En route | Client (GPS actif) |
| `DELIVERED` | Livré | Client + Fournisseur |
| `DISPUTED` | Litige ouvert | Admin |

---

## 7. Exemples de payloads

### Rejoindre un réseau (fetch JS)

```javascript
await fetch(`/api/v1/transport/reseau/7/rejoindre`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
```

### Accepter une course (fetch JS)

```javascript
const res = await fetch(`/api/v1/transport/orders/${order_id}/accepter`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});

if (res.status === 409) {
  // Trop tard — afficher "Course déjà prise"
} else if (res.ok) {
  const data = await res.json();
  // data.status === "ASSIGNED"
}
```

### Écouter les événements WebSocket

```javascript
const ws = new WebSocket(`wss://api.materiaux-express.bj/api/v1/ws?token=${token}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "NEW_ORDER_AVAILABLE":
      showNewOrderNotification(msg);
      break;

    case "ORDER_ACCEPTED":
      updateOrderStatus(msg.order_number, "ASSIGNED");
      showToast(`Course prise par ${msg.transporteur}`);
      break;

    case "ORDER_EN_ROUTE":
      updateOrderStatus(msg.order_number, "IN_PROGRESS");
      startGPSTracking(msg.order_number);
      break;
  }
};
```

---

## 8. Schéma d'écrans suggérés

### App Transporteur

```
┌─────────────────────────────────┐
│   🔔 Nouvelle course disponible │  ← bannière push
│   Livraison — Cotonou           │
│   25 tonnes · ~12 km            │
│                                 │
│   [Accepter]    [Ignorer]       │
└─────────────────────────────────┘

         ↓ (si accepté avec succès)

┌─────────────────────────────────┐
│   📦 Course assignée            │
│   ORD-20260505-0042             │
│   Quartier Gbégamey, Cotonou    │
│                                 │
│   [Je suis en route →]          │
└─────────────────────────────────┘

         ↓ (après PATCH en-route)

┌─────────────────────────────────┐
│   🚛 En cours de livraison      │
│   GPS actif                     │
│   [Confirmer livraison]         │
└─────────────────────────────────┘
```

### App Client

```
Suivi commande ORD-20260505-0042

  ● Confirmée       ✓  (CONFIRMED)
  ● Transporteur    ✓  (ASSIGNED — Transports Rapides Bj)
  ● En route        ✓  (IN_PROGRESS — carte GPS)
  ○ Livrée          …
```

---

## Notes techniques

- `order_id` est toujours un **UUID v4** (format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- Les notifications WS peuvent arriver **avant** que le frontend ait rechargé la liste des commandes — toujours écouter le WS en premier
- En cas de perte de connexion WS, effectuer un `GET /api/v1/devis/orders` pour resynchroniser les statuts
- Le mécanisme "premier arrivé" est géré **côté serveur** — ne jamais désactiver le bouton côté client avant d'avoir reçu la réponse 200 ou 409 de l'API  , voici un documenetpour le flow apres creation du devis . dit moi ce que tu as compris puis je te , analise l'existant puis je te dirai ce qu'on vas faire exactement 