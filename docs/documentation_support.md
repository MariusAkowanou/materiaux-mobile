# Documentation Technique de l'API - Module Support & Réclamations

Ce document répertorie les accès pour la gestion des tickets de réclamation (Litiges prolongés, aide générale sur l'utilisation, remboursements non perçus, etc.).

---

## Sommaire
1. [Fonctionnement du Ticketing](#1-fonctionnement-du-ticketing)
2. [Création et Consultation de tickets](#2-création-et-consultation-de-tickets)
3. [Espace Modérateur (Admin)](#3-espace-modérateur-admin)

---

## 1. Fonctionnement du Ticketing
Le module `support` est accessible par n'importe quel rôle connecté. 
1. L'utilisateur ouvre un `SupportTicket` en lui assignant un sujet et une priorité.
2. Un fil de discussion (`TicketMessage`) est initialisé.
3. L'Admin et le client discutent.
4. L'Admin peut créer des `messages internes` invisibles au client.
5. L'Admin clôture le ticket (Statut: `FERME`).

> **Préfixe des Requêtes** : `/support`

---

## 2. Création et Consultation de tickets

### Ouvrir un ticket
- **Méthode** : `POST /support/`
- **Payload (`SupportTicketCreate`)** :
```json
{
  "sujet": "Litige de livraison sur la commande X",
  "description": "Le camion n'est jamais arrivé hier...",
  "priorite": "HAUTE"
}
```

### Lister ses propres tickets
- **Méthode** : `GET /support/me`

### Rajouter un message dans la boucle
- **Méthode** : `POST /support/{ticket_id}/messages`
- **Payload** : `{"contenu": "Je vous envoie la photo du chantier...", "is_internal": false}`

---

## 3. Espace Modérateur (Admin)

Les URL suivantes sont strictement restreintes (rôles ADMIN / COLLABORATOR).

- `GET /support/` : Lister (et filtrer par statut via query params `?statut=EN_COURS`) les tickets de tous les acteurs.
- `PATCH /support/{ticket_id}` : Changer l'assignation en interne de la tâche ou fermer brutalement le ticket.
- `POST /support/{ticket_id}/messages` : *Si un admin utilise `is_internal: true` dans son payload, la réponse qu'il écrira dans le ticket sera taguée techniquement comme confidentielle et le frontend `Client` et `Partenaires` filtreront l'affichage pour le restreindre à l'administration de Sogetrap.*
