export type UserRole = 'ADMIN' | 'COMMERCANT' | 'CAMIONNEUR' | 'DESTINATAIRE';

export interface User {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: UserRole;
  avatarUrl?: string;
  adresse?: string;
  ville?: string;
  dateInscription: string;
  verifie: boolean;
  noteMoyenne?: number;
  nombreAvis?: number;
  // Spécifique Camionneur
  typeCamion?: string;
  capaciteKg?: number;
  immatriculation?: string;
  zonesDesservies?: string[];
  disponible?: boolean;
  documents?: {
    permisValide: boolean;
    carteGriseValide: boolean;
    assuranceValide: boolean;
  };
  // Spécifique Commerçant
  nomEntreprise?: string;
  secteurActivite?: string;
}

export type StatutDemande = 'OUVERTE' | 'OFFRE_ACCEPTEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface DestinataireInfo {
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
}

export interface DemandeTransport {
  id: string;
  reference: string;
  commercantId: string;
  commercantNom: string;
  commercantTelephone: string;
  origine: string;
  destination: string;
  dateChargement: string;
  dateLivraisonSouhaitee?: string;
  typeMarchandise: string;
  poidsKg: number;
  volumeM3?: number;
  instructionsManutention?: string;
  prixPropose: number; // En FCFA
  destinataire: DestinataireInfo;
  statut: StatutDemande;
  dateCreation: string;
  nombreOffres: number;
}

export type StatutOffre = 'EN_ATTENTE' | 'CONTRE_PROPOSITION' | 'ACCEPTEE' | 'REFUSEE' | 'RETIREE';

export interface ContreProposition {
  prix: number;
  message: string;
  auteurRole: 'COMMERCANT' | 'CAMIONNEUR';
  date: string;
}

export interface OffreTransport {
  id: string;
  demandeId: string;
  demandeReference: string;
  camionneurId: string;
  camionneurNom: string;
  camionneurTelephone: string;
  camionneurNote: number;
  prixPropose: number; // En FCFA
  dateDisponible: string;
  conditions: string;
  statut: StatutOffre;
  contreProposition?: ContreProposition;
  dateCreation: string;
}

export type StatutExpedition =
  | 'A_PAYER'
  | 'PAYEE_SEQUESTRE'
  | 'CHARGEE'
  | 'EN_ROUTE'
  | 'LIVREE_A_CONFIRMER'
  | 'LIVREE'
  | 'LITIGE'
  | 'ANNULEE';

export interface PositionGPS {
  lat: number;
  lng: number;
  derniereMiseAJour: string;
  source: 'DEMO' | 'GPS_REEL';
  precisionMetres?: number;
}

export interface EvenementHistorique {
  date: string;
  statut: StatutExpedition;
  description: string;
  auteur: string;
}

export interface Expedition {
  id: string;
  reference: string;
  demandeId: string;
  commercantId: string;
  commercantNom: string;
  camionneurId: string;
  camionneurNom: string;
  camionneurTelephone: string;
  destinataire: DestinataireInfo;
  origine: string;
  destination: string;
  typeMarchandise: string;
  poidsKg: number;
  prixConvenu: number;
  statut: StatutExpedition;
  codeOtp?: string; // Généré côté serveur/simulation
  otpValide?: boolean;
  positionActuelle?: PositionGPS;
  historique: EvenementHistorique[];
  dateCreation: string;
  dateLivraisonEstimee?: string;
}

export type StatutPaiement =
  | 'EN_ATTENTE'
  | 'INITIE'
  | 'CONFIRME_SEQUESTRE'
  | 'LIVRAISON_A_CONFIRMER'
  | 'LIBERE'
  | 'LITIGE_BLOQUE'
  | 'REMBOURSEMENT_EN_COURS'
  | 'REMBOURSE';

export interface OperationFinanciere {
  id: string;
  date: string;
  type: 'DEPOT_SEQUESTRE' | 'LIBERATION_CAMIONNEUR' | 'PRELEVEMENT_COMMISSION' | 'REMBOURSEMENT';
  montant: number;
  description: string;
  statut: 'SUCCES' | 'ECHEC' | 'EN_COURS';
}

export interface Transaction {
  id: string;
  reference: string;
  expeditionId: string;
  expeditionReference: string;
  commercantId: string;
  commercantNom: string;
  camionneurId: string;
  camionneurNom: string;
  montantTotal: number;
  tauxCommission: number; // 0.05 pour 5%
  montantCommission: number;
  montantNetTransporteur: number;
  montantSequestre: number;
  statut: StatutPaiement;
  waveReference?: string;
  dateCreation: string;
  operations: OperationFinanciere[];
}

export type StatutLitige = 'OUVERT' | 'EN_EXAMEN' | 'RESOLU';

export type ResolutionLitige =
  | 'LIBERATION_CAMIONNEUR'
  | 'REMBOURSEMENT_TOTAL'
  | 'REMBOURSEMENT_PARTIEL';

export interface Litige {
  id: string;
  reference: string;
  expeditionId: string;
  expeditionReference: string;
  declarantId: string;
  declarantNom: string;
  declarantRole: UserRole;
  motif: string;
  description: string;
  statut: StatutLitige;
  dateCreation: string;
  dateResolution?: string;
  typeResolution?: ResolutionLitige;
  montantRembourse?: number;
  decisionAdmin?: string;
}

export interface Evaluation {
  id: string;
  expeditionId: string;
  auteurId: string;
  auteurNom: string;
  auteurRole: UserRole;
  cibleId: string;
  cibleNom: string;
  note: number; // 1-5
  commentaire: string;
  date: string;
}

export interface StatsPlateforme {
  utilisateursActifs: number;
  demandesEnCours: number;
  transportsActifs: number;
  transactionsEnSequestre: number;
  transactionsLiberees: number;
  volumeTotalFCFA: number;
  commissionsTotalesFCFA: number;
  litigesOuverts: number;
  activiteParMois: { mois: string; volume: number; commissions: number }[];
}
