# Documentation Technique de l'API - Module Matériaux (Catalogue et Carrières)

Ce document décrit les points de terminaison (endpoints), les données échangées (requêtes & réponses), ainsi que le workflow global du backend concernant la gestion des matériaux, sous-catégories, carrières et paramétrage des offres fournisseurs.

---

## Sommaire
1. [Workflow Global (Frontend)](#1-workflow-global-frontend)
2. [Catégories & Paramètres Dynamiques](#2-catégories--paramètres-dynamiques)
3. [Catalogue Matériaux](#3-catalogue-matériaux)
4. [Carrières (Quarries / Sites d'extraction)](#4-carrières-quarries--sites-dextraction)
5. [Offres Fournisseurs](#5-offres-fournisseurs)

---

## 1. Workflow Global (Frontend)

Ce module est le cœur de la plateforme. Son fonctionnement s'articule ainsi :
1. **L'Admin** crée les `Catégories` (ex: Sables, Graviers) et y attache des paramètres optionnels (ex: dimensions dynamiques, granulométrie).
2. **L'Admin** remplit ensuite le grand `Catalogue des Matériaux`. Chaque matériau est lié à une catégorie. (ex: "Sable Lagunaire" lié à "Sables").
3. **Le Fournisseur** (SUPPLIER) crée/enregistre ses `Carrières` géolocalisées depuis le dashboard.
4. **Le Fournisseur** crée ensuite ses `Offres` : il associe un produit du catalogue à l'une de ses carrières, et y attribue un prix, une quantité minimale, etc.
5. **Le Client public** interroge le catalogue, récupère la liste des `Matériaux` et peut voir les fournisseurs disponibles et les tarifs minimaux affichés.

> **Préfixe des Requêtes** : `/materiaux`

---

## 2. Catégories & Paramètres Dynamiques

L'accès en modification (POST, PATCH, DELETE) nécessite le rôle **Administrateur**.

### Lister les catégories actives
- **Méthode** : `GET /materiaux/categories`
- **Requête métier** : Récupérer toutes les catégories pour le menu utilisateur (ex: navbar).
- **Réponse (200 OK)** : Tableau de `CategorieResponse` 
```json
[
  {
    "id": 1,
    "slug": "agregats-vrac",
    "nom": "Agrégats en vrac",
    "description": "Sable, gravier, tout-venant",
    "icone": "mdi-truck",
    "ordre": 10,
    "est_active": true,
    "transport_inclus": false
  }
]
```

### Administrer les catégories et paramètres
- `GET /materiaux/categories/all` : (Admin) Permet de lister même les inactives.
- `POST /materiaux/categories` : (Admin) Créer une catégorie.
- `GET /materiaux/categories/{cat_id}/parametres` : Récupère les paramètres de définition liés à une catégorie. *(Important pour le frontend : cela permet de générer des formulaires dynamiques si certains sables nécessitent un champs extra obligatoire comme la "granulométrie").*

---

## 3. Catalogue Matériaux

### Récupérer les Matériaux (Clients & Visiteurs)
- **Méthode** : `GET /materiaux`
- **Query Params** : `?categorie_id=1&skip=0&limit=20`
- **Réponse (200 OK)** : Objet paginé (`MateriauxPaginated`) listant succinctement les produits (avec la statistique de `nb_offres_actives` et une fourchette de prix min/max issue de la BDD).
```json
{
  "items": [
    {
      "id": 15,
      "slug": "sable-lagunaire-0-5",
      "nom": "Sable lagunaire 0/5",
      "categorie_id": 1,
      "categorie_nom": "Agrégats en vrac",
      "transport_inclus": false,
      "unite_vente": "M3",
      "image_principale": "https://bucket/img.png",
      "nb_offres_actives": 4,
      "prix_min": 7000.0,
      "prix_max": 8500.0
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

### Voir le détail complet d'un produit (Informations d'un Matériau)
- **Méthode** : `GET /materiaux/{mat_id}`
- **Réponse** : Fournit le catalogue complet avec les URLs d'images et les données paramétriques (ex: densités spécifiques).

---

## 4. Carrières (Quarries / Sites d'extraction)

Les carrières sont les points de départ physiques des camions. Chaque fournisseur (SUPPLIER) enregistre les siennes afin de permettre au système de logistique/devis de calculer la distance de livraison précise via Google Maps.

### Mes Carrières (Fournisseurs)
- **Requiert** : `Authorization: Bearer <Token_SUPPLIER>`
- **Méthode** : `GET /materiaux/carrieres/mes`
- **Réponse** : Liste des carrières (`CarriereResponse`).

### Ajouter une carrière
- **Méthode** : `POST /materiaux/carrieres`
- **Payload** : 
```json
{
  "nom": "Carrière de Pahou",
  "latitude": 6.3803,
  "longitude": 2.2234,
  "adresse_texte": "Route de Pahou, PK3",
  "village_id": 104
}
```

### Modifier / Supprimer une carrière
- `PATCH /materiaux/carrieres/{carriere_id}`
- `DELETE /materiaux/carrieres/{carriere_id}`

---

## 5. Offres Fournisseurs

Ici, le fournisseur choisit un produit existant dans le grand catalogue, y attache un prix de sortie, et lie tout ça à sa carrière.

### Mes Offres en cours (Fournisseurs)
- **Requiert** : `Authorization: Bearer <Token_SUPPLIER>`
- **Méthode** : `GET /materiaux/offres/mes`
- **Réponse** : Liste détaillée reprenant le nom du matériau, le nom de la carrière, et les contraintes logistiques.

### Mettre en vente un produit dans une carrière donnée
- **Méthode** : `POST /materiaux/offres`
- **Payload (`FournisseurOffreCreate`)** :
```json
{
  "materiau_id": 15,
  "carriere_id": 2,
  "prix_unitaire": 7500.00,
  "camion_type_id": 2,
  "transport_propre": true,
  "prix_transport_sep": 15000.00,
  "quantite_min_commande": 5.0,
  "delai_livraison_jours": 2
}
```
**Attention (Logique du Frontend)** : Si `transport_propre=true` (le fournisseur livre lui-même), le frontend doit impérativement forcer la saisie d'un `prix_transport_sep` (Prix fixe du transport du camion). Notez également qu'un fournisseur peut préciser quel est son délai de livraison standard ou la quantité min. de commande.

### Modifier, Suspendre ou Reprendre une offre
- `PATCH /materiaux/offres/{offre_id}` : Pour modifier le prix, etc.
- `PATCH /materiaux/offres/{offre_id}/statut` : Raccourci pour changer le statut (ex: *EN_RUPTURE*, *ACTIVE*, *ARCHIVEE*). 
  - Payload query : `?statut=EN_RUPTURE`.

### Voir les Offres (Fournisseurs) concurrentes ou disponibles (Public / Devis)
- **Méthode** : `GET /materiaux/{mat_id}/offres`
- **Réponse** : Résultat public (*les données de contacts précis sont masquées, seule la vue tarifaire/distance compte*), utile au système de cartographie ou simulateur de prix. La réponse utilise un masque `OffrePublicResponse` empêchant le client de bypasser la plateforme.
