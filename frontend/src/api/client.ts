import {
  DemandeTransport,
  Evaluation,
  Expedition,
  Litige,
  OffreTransport,
  ResolutionLitige,
  StatutExpedition,
  StatsPlateforme,
  Transaction,
  User,
  UserRole,
} from '../types';

export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: UserRole;
  nomEntreprise?: string;
  typeCamion?: string;
  capaciteKg?: number;
  immatriculation?: string;
  zonesDesservies?: string[];
}

export interface ApiClient {
  readonly isDemo: boolean;
  
  // Auth & Utilisateurs
  login(creds: LoginCredentials): Promise<{ user: User; token: string }>;
  register(data: RegisterData): Promise<{ user: User; token: string }>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(userId: string, updates: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;
  logout(): void;

  // Demandes
  getDemandes(filtres?: { commercantId?: string; statut?: string; zone?: string }): Promise<DemandeTransport[]>;
  getDemande(id: string): Promise<DemandeTransport | null>;
  createDemande(demande: Omit<DemandeTransport, 'id' | 'reference' | 'dateCreation' | 'nombreOffres' | 'statut'>): Promise<DemandeTransport>;
  annulerDemande(id: string): Promise<DemandeTransport>;

  // Offres
  getOffres(filtres?: { demandeId?: string; camionneurId?: string }): Promise<OffreTransport[]>;
  createOffre(offre: Omit<OffreTransport, 'id' | 'dateCreation' | 'statut' | 'demandeReference'>): Promise<OffreTransport>;
  accepterOffre(offreId: string): Promise<{ offre: OffreTransport; expedition: Expedition }>;
  refuserOffre(offreId: string): Promise<OffreTransport>;
  faireContreProposition(offreId: string, contreProp: { prix: number; message: string; auteurRole: 'COMMERCANT' | 'CAMIONNEUR' }): Promise<OffreTransport>;

  // Expéditions
  getExpeditions(filtres?: { commercantId?: string; camionneurId?: string; destinataireTelephone?: string }): Promise<Expedition[]>;
  getExpedition(id: string): Promise<Expedition | null>;
  payerSequestre(expeditionId: string, waveNumero: string): Promise<Transaction>;
  mettreAJourStatutExpedition(expeditionId: string, statut: StatutExpedition, note?: string): Promise<Expedition>;
  validerOtpLivraison(expeditionId: string, codeOtp: string): Promise<{ success: boolean; expedition: Expedition; message: string }>;

  // Transactions & Séquestre
  getTransactions(filtres?: { commercantId?: string; camionneurId?: string }): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;

  // Litiges
  getLitiges(): Promise<Litige[]>;
  creerLitige(litige: Omit<Litige, 'id' | 'reference' | 'dateCreation' | 'statut'>): Promise<Litige>;
  arbitrerLitige(litigeId: string, decision: { resolution: ResolutionLitige; motif: string; montantRembourse?: number }): Promise<Litige>;

  // Évaluations
  getEvaluations(filtres?: { cibleId?: string; auteurId?: string }): Promise<Evaluation[]>;
  creerEvaluation(evaluation: Omit<Evaluation, 'id' | 'date'>): Promise<Evaluation>;

  // Statistiques plateforme (Admin)
  getStats(): Promise<StatsPlateforme>;

  // Réinitialisation de démo
  resetDemoData(): Promise<void>;
}
