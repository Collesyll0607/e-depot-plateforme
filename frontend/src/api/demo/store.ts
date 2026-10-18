import {
  DemandeTransport,
  Evaluation,
  Expedition,
  Litige,
  OffreTransport,
  Transaction,
  User,
} from '../../types';
import {
  SEED_DEMANDES,
  SEED_EVALUATIONS,
  SEED_EXPEDITIONS,
  SEED_LITIGES,
  SEED_OFFRES,
  SEED_TRANSACTIONS,
  SEED_USERS,
} from './seed';

const STORAGE_KEYS = {
  USERS: 'edepot_demo_users',
  DEMANDES: 'edepot_demo_demandes',
  OFFRES: 'edepot_demo_offres',
  EXPEDITIONS: 'edepot_demo_expeditions',
  TRANSACTIONS: 'edepot_demo_transactions',
  LITIGES: 'edepot_demo_litiges',
  EVALUATIONS: 'edepot_demo_evaluations',
  CURRENT_USER_ID: 'edepot_demo_current_user_id',
};

class DemoDataStore {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.reset();
    }
  }

  reset() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(SEED_DEMANDES));
    localStorage.setItem(STORAGE_KEYS.OFFRES, JSON.stringify(SEED_OFFRES));
    localStorage.setItem(STORAGE_KEYS.EXPEDITIONS, JSON.stringify(SEED_EXPEDITIONS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.LITIGES, JSON.stringify(SEED_LITIGES));
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(SEED_EVALUATIONS));
    // Default current user = Commerçante Aïssatou
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-comm-1');
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  setUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getDemandes(): DemandeTransport[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMANDES) || '[]');
  }
  setDemandes(demandes: DemandeTransport[]) {
    localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));
  }

  getOffres(): OffreTransport[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFRES) || '[]');
  }
  setOffres(offres: OffreTransport[]) {
    localStorage.setItem(STORAGE_KEYS.OFFRES, JSON.stringify(offres));
  }

  getExpeditions(): Expedition[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPEDITIONS) || '[]');
  }
  setExpeditions(expeditions: Expedition[]) {
    localStorage.setItem(STORAGE_KEYS.EXPEDITIONS, JSON.stringify(expeditions));
  }

  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  }
  setTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  getLitiges(): Litige[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LITIGES) || '[]');
  }
  setLitiges(litiges: Litige[]) {
    localStorage.setItem(STORAGE_KEYS.LITIGES, JSON.stringify(litiges));
  }

  getEvaluations(): Evaluation[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATIONS) || '[]');
  }
  setEvaluations(evaluations: Evaluation[]) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
  setCurrentUserId(id: string | null) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }
}

export const demoStore = new DemoDataStore();
