# Documentation Technique de l'API - Module Facturation

L'API Facturation regroupe tout le système comptable final, de la matérialisation légale de la livraison (Bons de livraison avec OTP) à la production de la Facture certifiée en PDF.

---

## Sommaire
1. [Bons de Livraison (BL) et OTP](#1-bons-de-livraison-bl-et-otp)
2. [Factures (Invoices) et PDF](#2-factures-invoices-et-pdf)
3. [Règlements & Virements](#3-règlements--virements)
4. [Tarifs Dégressifs](#4-tarifs-dégressifs)

---

## 1. Bons de Livraison (BL) et OTP

Pour s'assurer qu'un fournisseur a bien livré la cargaison, la validation d'un BL clôturera la rotation du transporteur.

- `GET /facturation/bons-livraison/commande/{order_id}` : Historique des BL liés à une seule commande.
- `POST /facturation/bons-livraison/{bl_id}/valider` : Confirme qu'un camion a déchargé. 
  - **Payload avec OTP** : `{"otp_code": "483921", "gps_livraison": "6.369,2.434"}` *-> Conseillé si le transporteur et le chef de chantier se croisent.*

---

## 2. Factures (Invoices) et PDF

La facture finale est automatiquement rattachée aux commandes terminées.

### Historique des factures (Client)
- **Méthode** : `GET /facturation/mes-factures`

### Détail & Téléchargement
- **Méthode Détail API JSON** : `GET /facturation/factures/{invoice_id}`
- **Méthode Téléchargement PDF** : `GET /facturation/factures/{invoice_id}/pdf`
  *(Renvoie le Stream applicatif natif du fichier PDF généré au format A4)*

L'admin possède également la capacité de forcer la relance de génération du document PDF en appelant `POST /factures/{invoice_id}/generer-pdf`.

---

## 3. Règlements & Virements

Cas spécifique pour les clients professionnels utilisant "Virements bancaires" à longue durée.

- `POST /facturation/factures/{invoice_id}/payer` : `InitierReglementRequest` (permet de cibler un moyen de paiement hors connexion comme le Virement Bancaire ou Prélèvement et déposer le bordereau en base de données de Sogetrap).
- `GET /facturation/reglements/en-attente` : Admin Only. Trouve tous les virements qui dorment en attente.
- `POST /facturation/reglements/{payment_id}/confirmer` : Admin Only. *Payload: `{"approuve": true, "note_admin": "Virement validé, réf BCEAO"}`*. **C'est ce qui marque la commande comme enfin PAYÉE côté serveur.**

---

## 4. Tarifs Dégressifs

Afin d'inciter les clients finaux B2B, l'administrateur peut régler des "Remises sur paliers".
- `GET /facturation/tarifs-degressifs/{materiau_id}` : Renvoie un tableau des prix par paliers. *(Très utile pour le composant graphique public "Économisez jusqu'à X% en achetant Y tonnes" !)*.
- `POST` / `DELETE` : Configuration administrative.
