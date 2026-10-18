import {
  ApiClient,
  LoginCredentials,
  RegisterData,
} from '../client';
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
} from '../../types';
import { demoStore } from './store';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DemoApiClient implements ApiClient {
  readonly isDemo = true;

  // --- Authentification ---
  async login(creds: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay(250);
    const users = demoStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === creds.email.toLowerCase());

    if (!user) {
      throw new Error('Adresse email non reconnue.');
    }

    // En démo, nous acceptons le mot de passe s'il fait au moins 4 caractères ou 'Passer123!'
    if (!creds.motDePasse || creds.motDePasse.length < 4) {
      throw new Error('Mot de passe invalide (minimum 4 caractères).');
    }

    demoStore.setCurrentUserId(user.id);
    return {
      user,
      token: `demo-token-for-${user.id}-${Date.now()}`,
    };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await delay(300);
    const users = demoStore.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Un compte existe déjà avec cette adresse email.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      role: data.role,
      dateInscription: new Date().toISOString(),
      verifie: true,
      nomEntreprise: data.nomEntreprise,
      typeCamion: data.typeCamion,
      capaciteKg: data.capaciteKg,
      immatriculation: data.immatriculation,
      zonesDesservies: data.zonesDesservies || ['Ziguinchor'],
      disponible: true,
      noteMoyenne: 5.0,
      nombreAvis: 0,
      documents: data.role === 'CAMIONNEUR' ? {
        permisValide: true,
        carteGriseValide: true,
        assuranceValide: true,
      } : undefined,
    };

    users.push(newUser);
    demoStore.setUsers(users);
    demoStore.setCurrentUserId(newUser.id);

    return {
      user: newUser,
      token: `demo-token-for-${newUser.id}-${Date.now()}`,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    const id = demoStore.getCurrentUserId();
    if (!id) return null;
    const users = demoStore.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  logout(): void {
    demoStore.setCurrentUserId(null);
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(200);
    const users = demoStore.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('Utilisateur non trouvé');

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    demoStore.setUsers(users);
    return updated;
  }

  async getUsers(): Promise<User[]> {
    await delay(100);
    return demoStore.getUsers();
  }

  // --- Demandes de transport ---
  async getDemandes(filtres?: { commercantId?: string; statut?: string; zone?: string }): Promise<DemandeTransport[]> {
    await delay(200);
    let list = demoStore.getDemandes();
    if (filtres?.commercantId) {
      list = list.filter((d) => d.commercantId === filtres.commercantId);
    }
    if (filtres?.statut) {
      list = list.filter((d) => d.statut === filtres.statut);
    }
    if (filtres?.zone) {
      list = list.filter((d) => d.origine === filtres.zone || d.destination === filtres.zone);
    }
    return list;
  }

  async getDemande(id: string): Promise<DemandeTransport | null> {
    await delay(150);
    const list = demoStore.getDemandes();
    return list.find((d) => d.id === id) || null;
  }

  async createDemande(demandeData: Omit<DemandeTransport, 'id' | 'reference' | 'dateCreation' | 'nombreOffres' | 'statut'>): Promise<DemandeTransport> {
    await delay(300);
    const list = demoStore.getDemandes();
    const count = list.length + 1;
    const ref = `DEM-2025-${String(count).padStart(3, '0')}`;

    const newDemande: DemandeTransport = {
      ...demandeData,
      id: `dem-${Date.now()}`,
      reference: ref,
      dateCreation: new Date().toISOString(),
      nombreOffres: 0,
      statut: 'OUVERTE',
    };

    list.unshift(newDemande);
    demoStore.setDemandes(list);
    return newDemande;
  }

  async annulerDemande(id: string): Promise<DemandeTransport> {
    await delay(200);
    const list = demoStore.getDemandes();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Demande non trouvée');

    list[index].statut = 'ANNULEE';
    demoStore.setDemandes(list);
    return list[index];
  }

  // --- Offres ---
  async getOffres(filtres?: { demandeId?: string; camionneurId?: string }): Promise<OffreTransport[]> {
    await delay(200);
    let list = demoStore.getOffres();
    if (filtres?.demandeId) {
      list = list.filter((o) => o.demandeId === filtres.demandeId);
    }
    if (filtres?.camionneurId) {
      list = list.filter((o) => o.camionneurId === filtres.camionneurId);
    }
    return list;
  }

  async createOffre(offreData: Omit<OffreTransport, 'id' | 'dateCreation' | 'statut' | 'demandeReference'>): Promise<OffreTransport> {
    await delay(300);
    const demandes = demoStore.getDemandes();
    const demande = demandes.find((d) => d.id === offreData.demandeId);
    if (!demande) throw new Error('Demande introuvable.');

    const offres = demoStore.getOffres();
    const newOffre: OffreTransport = {
      ...offreData,
      id: `off-${Date.now()}`,
      demandeReference: demande.reference,
      statut: 'EN_ATTENTE',
      dateCreation: new Date().toISOString(),
    };

    offres.unshift(newOffre);
    demoStore.setOffres(offres);

    // Mettre à jour le compteur d'offres
    demande.nombreOffres += 1;
    demoStore.setDemandes(demandes);

    return newOffre;
  }

  async accepterOffre(offreId: string): Promise<{ offre: OffreTransport; expedition: Expedition }> {
    await delay(300);
    const offres = demoStore.getOffres();
    const offre = offres.find((o) => o.id === offreId);
    if (!offre) throw new Error('Offre non trouvée');

    const demandes = demoStore.getDemandes();
    const demande = demandes.find((d) => d.id === offre.demandeId);
    if (!demande) throw new Error('Demande liée non trouvée');

    // Mettre à jour les offres
    offre.statut = 'ACCEPTEE';
    offres.forEach((o) => {
      if (o.demandeId === demande.id && o.id !== offre.id && o.statut === 'EN_ATTENTE') {
        o.statut = 'REFUSEE';
      }
    });
    demoStore.setOffres(offres);

    // Mettre à jour la demande
    demande.statut = 'OFFRE_ACCEPTEE';
    demoStore.setDemandes(demandes);

    // Créer l'expédition
    const expeditions = demoStore.getExpeditions();
    const expCount = expeditions.length + 1;
    const expRef = `EXP-2025-${String(expCount).padStart(3, '0')}`;

    // Génération du code OTP de confirmation (4 chiffres)
    const codeOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newExpedition: Expedition = {
      id: `exp-${Date.now()}`,
      reference: expRef,
      demandeId: demande.id,
      commercantId: demande.commercantId,
      commercantNom: demande.commercantNom,
      camionneurId: offre.camionneurId,
      camionneurNom: offre.camionneurNom,
      camionneurTelephone: offre.camionneurTelephone,
      destinataire: demande.destinataire,
      origine: demande.origine,
      destination: demande.destination,
      typeMarchandise: demande.typeMarchandise,
      poidsKg: demande.poidsKg,
      prixConvenu: offre.prixPropose,
      statut: 'A_PAYER',
      codeOtp,
      historique: [
        {
          date: new Date().toISOString(),
          statut: 'A_PAYER',
          description: `Offre de ${offre.camionneurNom} acceptée pour ${offre.prixPropose} FCFA. Séquestre requis.`,
          auteur: 'Plateforme E-Dépôt',
        },
      ],
      dateCreation: new Date().toISOString(),
    };

    expeditions.unshift(newExpedition);
    demoStore.setExpeditions(expeditions);

    return { offre, expedition: newExpedition };
  }

  async refuserOffre(offreId: string): Promise<OffreTransport> {
    await delay(200);
    const offres = demoStore.getOffres();
    const offre = offres.find((o) => o.id === offreId);
    if (!offre) throw new Error('Offre non trouvée');

    offre.statut = 'REFUSEE';
    demoStore.setOffres(offres);
    return offre;
  }

  async faireContreProposition(
    offreId: string,
    contreProp: { prix: number; message: string; auteurRole: 'COMMERCANT' | 'CAMIONNEUR' }
  ): Promise<OffreTransport> {
    await delay(250);
    const offres = demoStore.getOffres();
    const offre = offres.find((o) => o.id === offreId);
    if (!offre) throw new Error('Offre non trouvée');

    offre.statut = 'CONTRE_PROPOSITION';
    offre.contreProposition = {
      ...contreProp,
      date: new Date().toISOString(),
    };

    demoStore.setOffres(offres);
    return offre;
  }

  // --- Expéditions & Séquestre Wave ---
  async getExpeditions(filtres?: { commercantId?: string; camionneurId?: string; destinataireTelephone?: string }): Promise<Expedition[]> {
    await delay(200);
    let list = demoStore.getExpeditions();
    if (filtres?.commercantId) {
      list = list.filter((e) => e.commercantId === filtres.commercantId);
    }
    if (filtres?.camionneurId) {
      list = list.filter((e) => e.camionneurId === filtres.camionneurId);
    }
    if (filtres?.destinataireTelephone) {
      list = list.filter((e) => e.destinataire.telephone.includes(filtres.destinataireTelephone!));
    }
    return list;
  }

  async getExpedition(id: string): Promise<Expedition | null> {
    await delay(150);
    const list = demoStore.getExpeditions();
    return list.find((e) => e.id === id) || null;
  }

  async payerSequestre(expeditionId: string, waveNumero: string): Promise<Transaction> {
    await delay(500); // Simuler appel Wave Sandbox
    const expeditions = demoStore.getExpeditions();
    const exp = expeditions.find((e) => e.id === expeditionId);
    if (!exp) throw new Error('Expédition non trouvée');

    const montantTotal = exp.prixConvenu;
    const tauxCommission = 0.05; // 5%
    const montantCommission = Math.round(montantTotal * tauxCommission);
    const montantNetTransporteur = montantTotal - montantCommission;

    const waveRef = `WAVE-SBX-${waveNumero.replace(/\D/g, '').slice(-5)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transactions = demoStore.getTransactions();
    const txCount = transactions.length + 1;
    const txRef = `TRX-2025-${String(txCount).padStart(3, '0')}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: txRef,
      expeditionId: exp.id,
      expeditionReference: exp.reference,
      commercantId: exp.commercantId,
      commercantNom: exp.commercantNom,
      camionneurId: exp.camionneurId,
      camionneurNom: exp.camionneurNom,
      montantTotal,
      tauxCommission,
      montantCommission,
      montantNetTransporteur,
      montantSequestre: montantTotal,
      statut: 'CONFIRME_SEQUESTRE',
      waveReference: waveRef,
      dateCreation: new Date().toISOString(),
      operations: [
        {
          id: `op-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'DEPOT_SEQUESTRE',
          montant: montantTotal,
          description: `Séquestre Wave Sandbox validé (${montantTotal} FCFA bloqués jusqu'à confirmation OTP)`,
          statut: 'SUCCES',
        },
      ],
    };

    transactions.unshift(newTx);
    demoStore.setTransactions(transactions);

    // Mettre à jour l'expédition
    exp.statut = 'PAYEE_SEQUESTRE';
    exp.historique.push({
      date: new Date().toISOString(),
      statut: 'PAYEE_SEQUESTRE',
      description: `Paiement en séquestre Wave Sandbox confirmé (${waveRef}). Le transporteur peut charger.`,
      auteur: 'Wave Sandbox API (Simulé)',
    });
    demoStore.setExpeditions(expeditions);

    return newTx;
  }

  async mettreAJourStatutExpedition(expeditionId: string, statut: StatutExpedition, note?: string): Promise<Expedition> {
    await delay(250);
    const expeditions = demoStore.getExpeditions();
    const exp = expeditions.find((e) => e.id === expeditionId);
    if (!exp) throw new Error('Expédition non trouvée');

    exp.statut = statut;
    exp.historique.push({
      date: new Date().toISOString(),
      statut,
      description: note || `Statut mis à jour : ${statut}`,
      auteur: 'Mise à jour transporteur',
    });

    demoStore.setExpeditions(expeditions);
    return exp;
  }

  async validerOtpLivraison(expeditionId: string, codeOtp: string): Promise<{ success: boolean; expedition: Expedition; message: string }> {
    await delay(350);
    const expeditions = demoStore.getExpeditions();
    const exp = expeditions.find((e) => e.id === expeditionId);
    if (!exp) throw new Error('Expédition non trouvée');

    if (exp.codeOtp !== codeOtp.trim()) {
      return {
        success: false,
        expedition: exp,
        message: 'Code OTP invalide. Veuillez vérifier le SMS reçu par le destinataire.',
      };
    }

    // OTP Valide : Clôturer la livraison et libérer le séquestre
    exp.otpValide = true;
    exp.statut = 'LIVREE';
    exp.historique.push({
      date: new Date().toISOString(),
      statut: 'LIVREE',
      description: 'Livraison confirmée par le destinataire via code OTP. Séquestre débloqué.',
      auteur: 'Destinataire (Validation OTP)',
    });
    demoStore.setExpeditions(expeditions);

    // Libérer les fonds dans la transaction
    const transactions = demoStore.getTransactions();
    const tx = transactions.find((t) => t.expeditionId === expeditionId);
    if (tx) {
      tx.statut = 'LIBERE';
      tx.operations.push(
        {
          id: `op-comm-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'PRELEVEMENT_COMMISSION',
          montant: tx.montantCommission,
          description: `Prélèvement commission plateforme 5 % (${tx.montantCommission} FCFA)`,
          statut: 'SUCCES',
        },
        {
          id: `op-pay-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'LIBERATION_CAMIONNEUR',
          montant: tx.montantNetTransporteur,
          description: `Virement Wave vers transporteur (${tx.montantNetTransporteur} FCFA)`,
          statut: 'SUCCES',
        }
      );
      demoStore.setTransactions(transactions);
    }

    return {
      success: true,
      expedition: exp,
      message: 'Livraison confirmée ! Les fonds ont été débloqués et versés au transporteur.',
    };
  }

  // --- Transactions ---
  async getTransactions(filtres?: { commercantId?: string; camionneurId?: string }): Promise<Transaction[]> {
    await delay(200);
    let list = demoStore.getTransactions();
    if (filtres?.commercantId) {
      list = list.filter((t) => t.commercantId === filtres.commercantId);
    }
    if (filtres?.camionneurId) {
      list = list.filter((t) => t.camionneurId === filtres.camionneurId);
    }
    return list;
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    await delay(150);
    const list = demoStore.getTransactions();
    return list.find((t) => t.id === id) || null;
  }

  // --- Litiges ---
  async getLitiges(): Promise<Litige[]> {
    await delay(200);
    return demoStore.getLitiges();
  }

  async creerLitige(litigeData: Omit<Litige, 'id' | 'reference' | 'dateCreation' | 'statut'>): Promise<Litige> {
    await delay(300);
    const litiges = demoStore.getLitiges();
    const ref = `LIT-2025-${String(litiges.length + 1).padStart(3, '0')}`;

    const newLitige: Litige = {
      ...litigeData,
      id: `lit-${Date.now()}`,
      reference: ref,
      statut: 'OUVERT',
      dateCreation: new Date().toISOString(),
    };

    litiges.unshift(newLitige);
    demoStore.setLitiges(litiges);

    // Mettre l'expédition et la transaction en état de litige
    const expeditions = demoStore.getExpeditions();
    const exp = expeditions.find((e) => e.id === litigeData.expeditionId);
    if (exp) {
      exp.statut = 'LITIGE';
      exp.historique.push({
        date: new Date().toISOString(),
        statut: 'LITIGE',
        description: `Litige ouvert : ${litigeData.motif}. Les fonds restent bloqués en séquestre.`,
        auteur: litigeData.declarantNom,
      });
      demoStore.setExpeditions(expeditions);
    }

    const transactions = demoStore.getTransactions();
    const tx = transactions.find((t) => t.expeditionId === litigeData.expeditionId);
    if (tx) {
      tx.statut = 'LITIGE_BLOQUE';
      demoStore.setTransactions(transactions);
    }

    return newLitige;
  }

  async arbitrerLitige(
    litigeId: string,
    decision: { resolution: ResolutionLitige; motif: string; montantRembourse?: number }
  ): Promise<Litige> {
    await delay(350);
    const litiges = demoStore.getLitiges();
    const litige = litiges.find((l) => l.id === litigeId);
    if (!litige) throw new Error('Litige introuvable');

    litige.statut = 'RESOLU';
    litige.dateResolution = new Date().toISOString();
    litige.typeResolution = decision.resolution;
    litige.decisionAdmin = decision.motif;
    litige.montantRembourse = decision.montantRembourse;

    demoStore.setLitiges(litiges);

    // Débloquer selon décision
    const transactions = demoStore.getTransactions();
    const tx = transactions.find((t) => t.expeditionId === litige.expeditionId);
    if (tx) {
      if (decision.resolution === 'LIBERATION_CAMIONNEUR') {
        tx.statut = 'LIBERE';
      } else if (decision.resolution === 'REMBOURSEMENT_TOTAL') {
        tx.statut = 'REMBOURSE';
      } else {
        tx.statut = 'REMBOURSE'; // Partiel
      }
      demoStore.setTransactions(transactions);
    }

    return litige;
  }

  // --- Évaluations ---
  async getEvaluations(filtres?: { cibleId?: string; auteurId?: string }): Promise<Evaluation[]> {
    await delay(200);
    let list = demoStore.getEvaluations();
    if (filtres?.cibleId) {
      list = list.filter((e) => e.cibleId === filtres.cibleId);
    }
    if (filtres?.auteurId) {
      list = list.filter((e) => e.auteurId === filtres.auteurId);
    }
    return list;
  }

  async creerEvaluation(evalData: Omit<Evaluation, 'id' | 'date'>): Promise<Evaluation> {
    await delay(250);
    const list = demoStore.getEvaluations();
    const newEval: Evaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      date: new Date().toISOString(),
    };

    list.unshift(newEval);
    demoStore.setEvaluations(list);

    // Recalculer la note moyenne de la cible
    const users = demoStore.getUsers();
    const targetUser = users.find((u) => u.id === evalData.cibleId);
    if (targetUser) {
      const userEvals = list.filter((e) => e.cibleId === targetUser.id);
      const total = userEvals.reduce((acc, curr) => acc + curr.note, 0);
      targetUser.noteMoyenne = parseFloat((total / userEvals.length).toFixed(1));
      targetUser.nombreAvis = userEvals.length;
      demoStore.setUsers(users);
    }

    return newEval;
  }

  // --- Stats Admin ---
  async getStats(): Promise<StatsPlateforme> {
    await delay(200);
    const users = demoStore.getUsers();
    const demandes = demoStore.getDemandes();
    const expeditions = demoStore.getExpeditions();
    const transactions = demoStore.getTransactions();
    const litiges = demoStore.getLitiges();

    const volumeTotal = transactions.reduce((acc, curr) => acc + curr.montantTotal, 0);
    const commissionsTotal = transactions.reduce((acc, curr) => acc + curr.montantCommission, 0);

    return {
      utilisateursActifs: users.length,
      demandesEnCours: demandes.filter((d) => d.statut === 'OUVERTE').length,
      transportsActifs: expeditions.filter((e) => ['PAYEE_SEQUESTRE', 'CHARGEE', 'EN_ROUTE'].includes(e.statut)).length,
      transactionsEnSequestre: transactions.filter((t) => t.statut === 'CONFIRME_SEQUESTRE').length,
      transactionsLiberees: transactions.filter((t) => t.statut === 'LIBERE').length,
      volumeTotalFCFA: volumeTotal,
      commissionsTotalesFCFA: commissionsTotal,
      litigesOuverts: litiges.filter((l) => l.statut === 'OUVERT').length,
      activiteParMois: [
        { mois: 'Janvier', volume: 450000, commissions: 22500 },
        { mois: 'Février', volume: 820000, commissions: 41000 },
        { mois: 'Mars', volume: volumeTotal || 1250000, commissions: commissionsTotal || 62500 },
      ],
    };
  }

  async resetDemoData(): Promise<void> {
    demoStore.reset();
  }
}

export const demoApiClient = new DemoApiClient();
