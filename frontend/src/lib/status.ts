import { StatutDemande, StatutExpedition, StatutLitige, StatutOffre, StatutPaiement } from '../types';

export function getStatutDemandeBadge(statut: StatutDemande): { label: string; className: string } {
  switch (statut) {
    case 'OUVERTE':
      return { label: 'Ouverte aux offres', className: 'badge-info' };
    case 'OFFRE_ACCEPTEE':
      return { label: 'Offre retenue', className: 'badge-warning' };
    case 'EN_COURS':
      return { label: 'En transit', className: 'badge-warning' };
    case 'TERMINEE':
      return { label: 'Livrée & Clôturée', className: 'badge-success' };
    case 'ANNULEE':
      return { label: 'Annulée', className: 'badge-neutral' };
    default:
      return { label: statut, className: 'badge-neutral' };
  }
}

export function getStatutOffreBadge(statut: StatutOffre): { label: string; className: string } {
  switch (statut) {
    case 'EN_ATTENTE':
      return { label: 'En attente', className: 'badge-info' };
    case 'CONTRE_PROPOSITION':
      return { label: 'Contre-offre', className: 'badge-warning' };
    case 'ACCEPTEE':
      return { label: 'Acceptée', className: 'badge-success' };
    case 'REFUSEE':
      return { label: 'Refusée', className: 'badge-danger' };
    case 'RETIREE':
      return { label: 'Retirée', className: 'badge-neutral' };
    default:
      return { label: statut, className: 'badge-neutral' };
  }
}

export function getStatutExpeditionBadge(statut: StatutExpedition): { label: string; className: string } {
  switch (statut) {
    case 'A_PAYER':
      return { label: 'Attente séquestre', className: 'badge-warning' };
    case 'PAYEE_SEQUESTRE':
      return { label: 'Séquestre bloqué', className: 'badge-info' };
    case 'CHARGEE':
      return { label: 'Marchandise chargée', className: 'badge-info' };
    case 'EN_ROUTE':
      return { label: 'En route', className: 'badge-info' };
    case 'LIVREE_A_CONFIRMER':
      return { label: 'Livré - OTP requis', className: 'badge-warning' };
    case 'LIVREE':
      return { label: 'Livré & Confirmé', className: 'badge-success' };
    case 'LITIGE':
      return { label: 'Litige en cours', className: 'badge-danger' };
    case 'ANNULEE':
      return { label: 'Annulée', className: 'badge-neutral' };
    default:
      return { label: statut, className: 'badge-neutral' };
  }
}

export function getStatutPaiementBadge(statut: StatutPaiement): { label: string; className: string } {
  switch (statut) {
    case 'EN_ATTENTE':
      return { label: 'En attente', className: 'badge-neutral' };
    case 'INITIE':
      return { label: 'Paiement initié', className: 'badge-info' };
    case 'CONFIRME_SEQUESTRE':
      return { label: 'Conservé en séquestre', className: 'badge-info' };
    case 'LIVRAISON_A_CONFIRMER':
      return { label: 'Livraison à confirmer', className: 'badge-warning' };
    case 'LIBERE':
      return { label: 'Paiement libéré', className: 'badge-success' };
    case 'LITIGE_BLOQUE':
      return { label: 'Fonds bloqués (litige)', className: 'badge-danger' };
    case 'REMBOURSEMENT_EN_COURS':
      return { label: 'Remboursement en cours', className: 'badge-warning' };
    case 'REMBOURSE':
      return { label: 'Remboursé', className: 'badge-neutral' };
    default:
      return { label: statut, className: 'badge-neutral' };
  }
}

export function getStatutLitigeBadge(statut: StatutLitige): { label: string; className: string } {
  switch (statut) {
    case 'OUVERT':
      return { label: 'Ouvert', className: 'badge-danger' };
    case 'EN_EXAMEN':
      return { label: 'En examen', className: 'badge-warning' };
    case 'RESOLU':
      return { label: 'Résolu', className: 'badge-success' };
    default:
      return { label: statut, className: 'badge-neutral' };
  }
}
