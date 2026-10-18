import {
  ApiClient,
  LoginCredentials,
  RegisterData,
} from './client';
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
} from '../types';

export class HttpApiClient implements ApiClient {
  readonly isDemo = false;
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1';
    this.token = localStorage.getItem('edepot_auth_token');
  }

  private setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('edepot_auth_token', token);
    } else {
      localStorage.removeItem('edepot_auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `Erreur serveur (${response.status})`;
      try {
        const errorData = await response.json();
        errMsg = errorData.message || errMsg;
      } catch {
        // Fallback
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  // --- Auth ---
  async login(creds: LoginCredentials): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    try {
      return await this.request<User>('/auth/me');
    } catch {
      this.setToken(null);
      return null;
    }
  }

  logout(): void {
    this.setToken(null);
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // --- Demandes ---
  async getDemandes(filtres?: { commercantId?: string; statut?: string; zone?: string }): Promise<DemandeTransport[]> {
    const params = new URLSearchParams();
    if (filtres?.commercantId) params.append('commercantId', filtres.commercantId);
    if (filtres?.statut) params.append('statut', filtres.statut);
    if (filtres?.zone) params.append('zone', filtres.zone);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<DemandeTransport[]>(`/demandes${query}`);
  }

  async getDemande(id: string): Promise<DemandeTransport | null> {
    return this.request<DemandeTransport>(`/demandes/${id}`);
  }

  async createDemande(demande: Omit<DemandeTransport, 'id' | 'reference' | 'dateCreation' | 'nombreOffres' | 'statut'>): Promise<DemandeTransport> {
    return this.request<DemandeTransport>('/demandes', {
      method: 'POST',
      body: JSON.stringify(demande),
    });
  }

  async annulerDemande(id: string): Promise<DemandeTransport> {
    return this.request<DemandeTransport>(`/demandes/${id}/annuler`, {
      method: 'POST',
    });
  }

  // --- Offres ---
  async getOffres(filtres?: { demandeId?: string; camionneurId?: string }): Promise<OffreTransport[]> {
    const params = new URLSearchParams();
    if (filtres?.demandeId) params.append('demandeId', filtres.demandeId);
    if (filtres?.camionneurId) params.append('camionneurId', filtres.camionneurId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<OffreTransport[]>(`/offres${query}`);
  }

  async createOffre(offre: Omit<OffreTransport, 'id' | 'dateCreation' | 'statut' | 'demandeReference'>): Promise<OffreTransport> {
    return this.request<OffreTransport>('/offres', {
      method: 'POST',
      body: JSON.stringify(offre),
    });
  }

  async accepterOffre(offreId: string): Promise<{ offre: OffreTransport; expedition: Expedition }> {
    return this.request<{ offre: OffreTransport; expedition: Expedition }>(`/offres/${offreId}/accepter`, {
      method: 'POST',
    });
  }

  async refuserOffre(offreId: string): Promise<OffreTransport> {
    return this.request<OffreTransport>(`/offres/${offreId}/refuser`, {
      method: 'POST',
    });
  }

  async faireContreProposition(
    offreId: string,
    contreProp: { prix: number; message: string; auteurRole: 'COMMERCANT' | 'CAMIONNEUR' }
  ): Promise<OffreTransport> {
    return this.request<OffreTransport>(`/offres/${offreId}/contre-proposition`, {
      method: 'POST',
      body: JSON.stringify(contreProp),
    });
  }

  // --- Expéditions ---
  async getExpeditions(filtres?: { commercantId?: string; camionneurId?: string; destinataireTelephone?: string }): Promise<Expedition[]> {
    const params = new URLSearchParams();
    if (filtres?.commercantId) params.append('commercantId', filtres.commercantId);
    if (filtres?.camionneurId) params.append('camionneurId', filtres.camionneurId);
    if (filtres?.destinataireTelephone) params.append('destinataireTelephone', filtres.destinataireTelephone);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Expedition[]>(`/expeditions${query}`);
  }

  async getExpedition(id: string): Promise<Expedition | null> {
    return this.request<Expedition>(`/expeditions/${id}`);
  }

  async payerSequestre(expeditionId: string, waveNumero: string): Promise<Transaction> {
    return this.request<Transaction>(`/expeditions/${expeditionId}/payer-sequestre`, {
      method: 'POST',
      body: JSON.stringify({ waveNumero }),
    });
  }

  async mettreAJourStatutExpedition(expeditionId: string, statut: StatutExpedition, note?: string): Promise<Expedition> {
    return this.request<Expedition>(`/expeditions/${expeditionId}/statut`, {
      method: 'PATCH',
      body: JSON.stringify({ statut, note }),
    });
  }

  async validerOtpLivraison(expeditionId: string, codeOtp: string): Promise<{ success: boolean; expedition: Expedition; message: string }> {
    return this.request<{ success: boolean; expedition: Expedition; message: string }>(
      `/expeditions/${expeditionId}/valider-otp`,
      {
        method: 'POST',
        body: JSON.stringify({ codeOtp }),
      }
    );
  }

  // --- Transactions ---
  async getTransactions(filtres?: { commercantId?: string; camionneurId?: string }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filtres?.commercantId) params.append('commercantId', filtres.commercantId);
    if (filtres?.camionneurId) params.append('camionneurId', filtres.camionneurId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Transaction[]>(`/transactions${query}`);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  // --- Litiges ---
  async getLitiges(): Promise<Litige[]> {
    return this.request<Litige[]>('/litiges');
  }

  async creerLitige(litige: Omit<Litige, 'id' | 'reference' | 'dateCreation' | 'statut'>): Promise<Litige> {
    return this.request<Litige>('/litiges', {
      method: 'POST',
      body: JSON.stringify(litige),
    });
  }

  async arbitrerLitige(
    litigeId: string,
    decision: { resolution: ResolutionLitige; motif: string; montantRembourse?: number }
  ): Promise<Litige> {
    return this.request<Litige>(`/litiges/${litigeId}/arbitrer`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  }

  // --- Évaluations ---
  async getEvaluations(filtres?: { cibleId?: string; auteurId?: string }): Promise<Evaluation[]> {
    const params = new URLSearchParams();
    if (filtres?.cibleId) params.append('cibleId', filtres.cibleId);
    if (filtres?.auteurId) params.append('auteurId', filtres.auteurId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Evaluation[]>(`/evaluations${query}`);
  }

  async creerEvaluation(evaluation: Omit<Evaluation, 'id' | 'date'>): Promise<Evaluation> {
    return this.request<Evaluation>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluation),
    });
  }

  // --- Stats ---
  async getStats(): Promise<StatsPlateforme> {
    return this.request<StatsPlateforme>('/admin/stats');
  }

  async resetDemoData(): Promise<void> {
    // Non supporté en mode HTTP
    return Promise.resolve();
  }
}
